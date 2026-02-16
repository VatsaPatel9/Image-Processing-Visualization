import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function TemplateMatchingComputationDisplay({ hoverState, templateImage, operationName, compact = false }) {
  if (!hoverState) {
    if (compact) return null;
    return (
      <div className="text-center py-3 text-sm text-muted-foreground">
        Hover over a pixel on the output to see the match computation
      </div>
    );
  }

  const { pixel, computation } = hoverState;

  if (!computation) {
    return null;
  }

  const { score, normalizedScore, formula, templateBounds, steps } = computation;
  const { x, y, width, height } = templateBounds || { x: pixel.x, y: pixel.y, width: 0, height: 0 };

  // Sample first 9 pixels for visualization (3x3 grid)
  const sampleSize = Math.min(9, steps?.length || 0);
  const sampleSteps = steps?.slice(0, sampleSize) || [];

  const content = (
    <>
      {/* Template position info */}
      <div className="text-xs text-center">
        <span className="text-muted-foreground">Template at </span>
        <span className="font-mono font-medium">({x}, {y})</span>
        <span className="text-muted-foreground"> → </span>
        <span className="font-mono font-medium">({x + width}, {y + height})</span>
      </div>

      {/* Match score */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">Match Score</span>
          <span className="text-lg font-bold font-mono">{score.toFixed(4)}</span>
        </div>
        <span className="text-muted-foreground">&rarr;</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">Heatmap</span>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: `rgb(${normalizedScore}, ${normalizedScore}, ${normalizedScore})` }}
            />
            <span className="text-sm font-mono">{normalizedScore}/255</span>
          </div>
        </div>
      </div>

      {/* Formula */}
      {formula && (
        <div className="text-[10px] font-mono text-center text-foreground bg-muted rounded px-2 py-1.5 whitespace-pre-line max-w-[280px]">
          {formula}
        </div>
      )}

      {/* Sample pixel comparisons (first 9 pixels) */}
      {sampleSteps.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
            Sample Comparisons
          </span>
          <div className="grid grid-cols-3 gap-1">
            {sampleSteps.map((step, idx) => {
              const diff = step.sourceValue - step.templateValue;
              const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground';
              return (
                <div key={idx} className="flex flex-col items-center bg-muted/50 rounded px-1 py-0.5">
                  <div className="flex items-center gap-0.5 text-[9px]">
                    <span className="font-mono">{Math.round(step.templateValue)}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-mono">{Math.round(step.sourceValue)}</span>
                  </div>
                  <span className={`text-[8px] font-mono ${diffColor}`}>
                    {diff > 0 ? '+' : ''}{Math.round(diff)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operation name */}
      {operationName && (
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {operationName}
        </span>
      )}
    </>
  );

  if (compact) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-2 flex flex-col items-center gap-2 max-w-xs">
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="py-1.5 px-3 bg-muted/50">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          Template Position ({pixel.x}, {pixel.y})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex flex-col items-center gap-3">
        {content}
      </CardContent>
    </Card>
  );
}

export default TemplateMatchingComputationDisplay;
