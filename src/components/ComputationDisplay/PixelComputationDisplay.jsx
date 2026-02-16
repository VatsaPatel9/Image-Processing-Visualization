import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function PixelComputationDisplay({ hoverState, operationName, isGrayscale = false, compact = false }) {
  if (!hoverState) {
    if (compact) return null;
    return (
      <div className="text-center py-3 text-sm text-muted-foreground">
        Hover over a pixel on either image to see the computation
      </div>
    );
  }

  const { pixel, computation, inputPixel } = hoverState;
  const { result, formula } = computation;

  const fmtPixel = (p) =>
    isGrayscale ? String(p.r) : `(${p.r}, ${p.g}, ${p.b})`;

  const content = (
    <>
      {/* Input → Output color swatches */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: `rgb(${inputPixel.r}, ${inputPixel.g}, ${inputPixel.b})` }}
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            {fmtPixel(inputPixel)}
          </span>
        </div>
        <span className="text-lg text-muted-foreground">&rarr;</span>
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: `rgb(${result.r}, ${result.g}, ${result.b})` }}
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            {fmtPixel(result)}
          </span>
        </div>
      </div>

      {/* Formula */}
      <div className="text-xs font-mono text-center text-foreground bg-muted rounded px-3 py-1.5">
        {formula}
      </div>

      {/* Operation name */}
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {operationName}
      </span>
    </>
  );

  if (compact) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-2 flex flex-col items-center gap-3">
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="py-1.5 px-3 bg-muted/50">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          Pixel ({pixel.x}, {pixel.y})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex flex-col items-center gap-3">
        {content}
      </CardContent>
    </Card>
  );
}

export default PixelComputationDisplay;
