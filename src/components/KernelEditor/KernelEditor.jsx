import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { predefinedKernels, isPresetAvailableForSize, getPresetForSize } from '../../config/kernels';
import { cn } from '@/lib/utils';

function KernelEditor({ kernel, onKernelChange, allowCustom = true, normalize, onNormalizeChange }) {
  const [localKernel, setLocalKernel] = useState(kernel || [[0, 0, 0], [0, 1, 0], [0, 0, 0]]);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [kernelSize, setKernelSize] = useState(3);

  useEffect(() => {
    if (kernel) {
      setLocalKernel(kernel);
      setKernelSize(kernel.length);
    }
  }, [kernel]);

  const handleCellChange = (row, col, value) => {
    if (!allowCustom) return;

    const numValue = parseFloat(value) || 0;
    const newKernel = localKernel.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? numValue : c)) : [...r]
    );

    setLocalKernel(newKernel);
    setSelectedPreset('custom');
    onKernelChange(newKernel);
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);

    if (presetKey === 'custom') return;

    const preset = getPresetForSize(presetKey, kernelSize);
    if (preset) {
      setLocalKernel(preset.kernel);
      onKernelChange(preset.kernel);
      if (onNormalizeChange) {
        onNormalizeChange(preset.normalize);
      }
    }
  };

  const calculateSum = () => {
    return localKernel.flat().reduce((sum, val) => sum + val, 0);
  };

  const handleKernelSizeChange = (newSize) => {
    const size = parseInt(newSize);
    if (size < 3 || size > 9 || size % 2 === 0) return;

    setKernelSize(size);
    setSelectedPreset('custom');

    const center = Math.floor(size / 2);
    const newKernel = Array(size).fill(0).map((_, i) =>
      Array(size).fill(0).map((_, j) => (i === center && j === center) ? 1 : 0)
    );

    setLocalKernel(newKernel);
    onKernelChange(newKernel);
  };

  const cellSize = kernelSize > 7 ? 'w-[30px]' : kernelSize > 5 ? 'w-[38px]' : kernelSize > 3 ? 'w-[48px]' : 'w-[60px]';

  const maxAbsVal = Math.max(...localKernel.flat().map(Math.abs), 1);
  const getValueTint = (val) => {
    if (val === 0) return {};
    const intensity = Math.min(Math.abs(val) / maxAbsVal, 1);
    const alpha = (Math.round(intensity * 15) + 5) / 100;
    return val > 0
      ? { backgroundColor: `rgba(59, 130, 246, ${alpha})` }
      : { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Kernel Editor</CardTitle>
          {allowCustom && (
            <div className="flex items-center gap-2">
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue placeholder="Preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {Object.keys(predefinedKernels).map(key => {
                    const available = isPresetAvailableForSize(key, kernelSize);
                    return (
                      <SelectItem key={key} value={key} disabled={!available}>
                        {predefinedKernels[key].name}
                        {!available ? ` (3x3 only)` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={String(kernelSize)} onValueChange={handleKernelSizeChange}>
                <SelectTrigger className="h-8 text-xs w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3x3</SelectItem>
                  <SelectItem value="5">5x5</SelectItem>
                  <SelectItem value="7">7x7</SelectItem>
                  <SelectItem value="9">9x9</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-1">
          {localKernel.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((cell, colIndex) => {
                const center = Math.floor(kernelSize / 2);
                const isCenter = rowIndex === center && colIndex === center;
                return (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="number"
                    step="0.1"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className={cn(
                      cellSize,
                      "h-8 text-center text-xs border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-ring",
                      isCenter && "ring-2 ring-primary font-bold",
                      !allowCustom && "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    style={allowCustom ? getValueTint(cell) : undefined}
                    disabled={!allowCustom}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Sum: {calculateSum().toFixed(2)}</span>
          {onNormalizeChange && (
            <div className="flex items-center gap-2">
              <Switch
                id="normalize"
                checked={normalize}
                onCheckedChange={onNormalizeChange}
              />
              <label htmlFor="normalize" className="text-xs cursor-pointer">
                Normalize
              </label>
            </div>
          )}
        </div>
        {normalize && calculateSum() !== 0 && (
          <div className="text-xs text-muted-foreground/70 mt-1">
            Kernel will be divided by {calculateSum().toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KernelEditor;
