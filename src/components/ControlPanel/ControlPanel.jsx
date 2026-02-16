import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ImageUploader from '../ImageUploader/ImageUploader';
import ExportButton from '../ExportButton/ExportButton';

function ControlPanel({
  subtopic,
  parameters,
  onParameterChange,
  onImageLoad,
  outputImage,
  imageSize,
  onImageSizeChange,
  colorMode,
  onColorModeChange
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subtopic?.parameters && subtopic.parameters.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Parameters
            </label>
            {subtopic.parameters.map(param => (
              <div key={param.name} className="space-y-1.5">
                {param.type === 'slider' && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {param.name}
                      </label>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {parameters[param.name] ?? param.default}{param.unit}
                      </span>
                    </div>
                    <Slider
                      value={[parameters[param.name] ?? param.default]}
                      onValueChange={(val) => onParameterChange(param.name, val[0])}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                    />
                  </>
                )}
                {param.type === 'dropdown' && (
                  <>
                    <label className="text-sm font-medium">{param.name}</label>
                    <Select
                      value={String(parameters[param.name] ?? param.default)}
                      onValueChange={(val) => onParameterChange(param.name, val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options.map(opt => (
                          <SelectItem key={opt} value={String(opt)}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            ))}
            <Separator />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Image Controls
          </label>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap">Color Mode:</label>
            <Select value={colorMode} onValueChange={onColorModeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grayscale">Grayscale (0-255)</SelectItem>
                <SelectItem value="rgb">RGB Color</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <ImageUploader
          onImageLoad={onImageLoad}
          imageSize={imageSize}
          onImageSizeChange={onImageSizeChange}
        />

        <Separator />

        <ExportButton imageData={outputImage} />
      </CardContent>
    </Card>
  );
}

export default ControlPanel;
