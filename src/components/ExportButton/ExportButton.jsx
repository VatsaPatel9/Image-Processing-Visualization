import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadImage } from '../../utils/imageUtils';

function ExportButton({ imageData, disabled = false }) {
  const handleExport = async () => {
    if (!imageData) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    await downloadImage(imageData, `processed-image-${timestamp}.png`);
  };

  return (
    <Button
      className="w-full gap-2"
      onClick={handleExport}
      disabled={disabled || !imageData}
    >
      <Download className="h-4 w-4" />
      Export Image
    </Button>
  );
}

export default ExportButton;
