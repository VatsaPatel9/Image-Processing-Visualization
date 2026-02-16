import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ModeToggle } from '@/components/ModeToggle';
import TopicSelector from './components/TopicSelector/TopicSelector';
import OperationSelector from './components/OperationSelector/OperationSelector';
import ImageCanvas from './components/ImageCanvas/ImageCanvas';
import InfoPanel from './components/InfoPanel/InfoPanel';
import ControlPanel from './components/ControlPanel/ControlPanel';
import KernelEditor from './components/KernelEditor/KernelEditor';
import TemplateMatchingControls from './components/TemplateMatchingControls/TemplateMatchingControls';
import { topics } from './config/topics';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useConvolutionAnimation } from './hooks/useConvolutionAnimation';
import { usePixelAnimation } from './hooks/usePixelAnimation';
import { useTemplateMatchingAnimation } from './hooks/useTemplateMatchingAnimation';
import { createGradientImage, convertToGrayscale, resizeToTarget } from './utils/imageUtils';
import { ImageProcessor } from './core/ImageProcessor';

const SIZE_MAP = { small: 32, medium: 64, large: 128, xlarge: 256, original: null };

function App() {
  const [selectedTopicId, setSelectedTopicId] = useState('convolution');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('box-blur');
  const [inputImage, setInputImage] = useState(null);
  const [originalInputImage, setOriginalInputImage] = useState(null);
  const [templateImage, setTemplateImage] = useState(null);
  const [selectionBounds, setSelectionBounds] = useState(null);
  const [parameters, setParameters] = useState({});
  const [kernel, setKernel] = useState(null);
  const [normalize, setNormalize] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(false);
  const [imageSize, setImageSize] = useState('small');
  const [colorMode, setColorMode] = useState('grayscale');

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedSubtopic = selectedTopic?.subtopics.find(st => st.id === selectedSubtopicId);

  // Use the image processor hook (only when not animating)
  const { outputImage } = useImageProcessor(inputImage, selectedSubtopic, parameters, kernel, normalize, templateImage);

  // Use animation hook for convolution operations when enabled
  const isConvolution = selectedTopic?.id === 'convolution';
  const isPixelOp = selectedTopic?.id === 'pixel-processing';
  const showConvAnimation = isConvolution && animationEnabled;
  const showPixelAnimation = isPixelOp && animationEnabled;

  const convAnimationState = useConvolutionAnimation(
    showConvAnimation ? inputImage : null,
    kernel,
    normalize
  );

  const pixelAnimationState = usePixelAnimation(
    showPixelAnimation ? inputImage : null,
    selectedSubtopic?.method,
    parameters
  );

  // Use animation hook for template matching operations when enabled
  const isTemplateMatching = selectedTopic?.id === 'template-matching';
  const showTemplateAnimation = isTemplateMatching && animationEnabled && templateImage;

  const templateAnimationState = useTemplateMatchingAnimation(
    showTemplateAnimation ? inputImage : null,
    showTemplateAnimation ? templateImage : null,
    selectedSubtopic?.id  // 'ncc', 'ssd', or 'sad'
  );

  // Enable hover when not animating (works for both convolution and pixel operations)
  const showHover = !!selectedSubtopic && !animationEnabled;

  // Load default image on mount
  useEffect(() => {
    const defaultImage = createGradientImage(256, 256);
    setOriginalInputImage(defaultImage);
  }, []);

  // Derive inputImage from originalInputImage + imageSize + colorMode
  useEffect(() => {
    if (!originalInputImage) return;
    const target = SIZE_MAP[imageSize];
    let sized = originalInputImage;
    if (target) {
      sized = resizeToTarget(originalInputImage, target, target);
    }
    if (colorMode === 'grayscale') {
      setInputImage(convertToGrayscale(sized));
    } else {
      setInputImage(sized);
    }
  }, [originalInputImage, imageSize, colorMode]);

  // Extract template from selection bounds
  useEffect(() => {
    if (!selectionBounds || !inputImage) {
      setTemplateImage(null);
      return;
    }

    try {
      // Extract region from input image
      const extracted = ImageProcessor.extractRegion(
        inputImage,
        selectionBounds.x,
        selectionBounds.y,
        selectionBounds.width,
        selectionBounds.height
      );
      setTemplateImage(extracted);
    } catch (error) {
      console.error('Failed to extract region:', error);
      setTemplateImage(null);
    }
  }, [selectionBounds, inputImage]);

  // Update kernel and normalize when subtopic changes
  useEffect(() => {
    setKernel(selectedSubtopic?.defaultKernel ?? null);
    if (selectedSubtopic?.normalize !== undefined) {
      setNormalize(selectedSubtopic.normalize);
    }
  }, [selectedSubtopic]);

  const handleTopicChange = (topicId) => {
    setSelectedTopicId(topicId);
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.subtopics.length > 0) {
      setSelectedSubtopicId(topic.subtopics[0].id);
    }
    // Reset selection when leaving template matching topic
    if (topicId !== 'template-matching') {
      setSelectionBounds(null);
      setTemplateImage(null);
    }
  };

  const handleSubtopicChange = (subtopicId) => {
    setSelectedSubtopicId(subtopicId);
    setParameters({});
  };

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const handleImageLoad = (imageData) => {
    setOriginalInputImage(imageData);
  };

  // Pick active animation state
  const showAnimation = showConvAnimation || showPixelAnimation || showTemplateAnimation;
  const animationState = showConvAnimation ? convAnimationState
    : showPixelAnimation ? pixelAnimationState
    : showTemplateAnimation ? templateAnimationState
    : null;

  return (
    <div className="flex flex-col min-h-screen xl:h-screen bg-surface">
      {/* Header */}
      <header className="shrink-0 border-b bg-card">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Image Processing Lab
          </h1>
          <ModeToggle />
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <TopicSelector
            topics={topics}
            selectedTopicId={selectedTopicId}
            onTopicChange={handleTopicChange}
          />
          {selectedSubtopic && (
            <OperationSelector
              subtopics={selectedTopic.subtopics}
              selectedSubtopicId={selectedSubtopicId}
              onSubtopicChange={handleSubtopicChange}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 xl:min-h-0">
        <div className="grid xl:grid-cols-[1fr_380px] xl:h-full">
          {/* Left Panel: Canvas Area */}
          <div className="xl:overflow-y-auto p-4 scrollbar-thin">
            {/* Topic explanation & page guide */}
            {selectedTopic && (
              <div className="mb-4 rounded-lg border bg-card p-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTopic.topicExplanation}
                </p>
                <p className="text-[11px] text-muted-foreground/80 border-t pt-2">
                  Select an <strong>operation</strong> from the bar above and hover over either canvas to see the per-pixel computation. You can also use the sidebar to tweak parameters, edit the kernel, or upload your own image.
                </p>
              </div>
            )}
            <ImageCanvas
              inputImage={inputImage}
              templateImage={templateImage}
              outputImage={outputImage}
              selectionBounds={selectionBounds}
              onSelectionChange={setSelectionBounds}
              enableAnimation={showAnimation}
              animationState={showAnimation ? animationState : null}
              animationEnabled={animationEnabled}
              onAnimationToggle={() => setAnimationEnabled(!animationEnabled)}
              enableHover={showHover}
              subtopic={selectedSubtopic}
              kernel={kernel}
              normalize={normalize}
              parameters={parameters}
              kernelName={selectedSubtopic?.title || 'Custom'}
              selectedTopicId={selectedTopicId}
            />
          </div>

          {/* Right Sidebar */}
          <div className="xl:overflow-y-auto border-l bg-sidebar p-4 space-y-3 scrollbar-thin">
            <AnimatePresence mode="wait">
              {selectedSubtopic?.allowCustomKernel && kernel && (
                <motion.div
                  key="kernel-editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <KernelEditor
                    kernel={kernel}
                    onKernelChange={setKernel}
                    allowCustom={selectedSubtopic.allowCustomKernel}
                    normalize={normalize}
                    onNormalizeChange={setNormalize}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {selectedSubtopic && (
              <InfoPanel
                title={selectedSubtopic.title}
                description={selectedSubtopic.description}
                explanation={selectedSubtopic.explanation}
                formula={selectedSubtopic.formula}
              />
            )}

            {/* Template Matching Controls - show when template exists or animation has been started */}
            {isTemplateMatching && (templateImage || animationEnabled) && (
              <TemplateMatchingControls animationState={templateAnimationState} />
            )}

            {selectedSubtopic && (
              <ControlPanel
                subtopic={selectedSubtopic}
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onImageLoad={handleImageLoad}
                outputImage={outputImage}
                imageSize={imageSize}
                onImageSizeChange={setImageSize}
                colorMode={colorMode}
                onColorModeChange={setColorMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t bg-card px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Dr. Vatsa S. Patel. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
