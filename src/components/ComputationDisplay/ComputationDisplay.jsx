import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function ComputationDisplay({ hoverState, kernelName, isGrayscale = true, compact = false }) {
  if (!hoverState) {
    if (compact) return null;
    return (
      <div className="text-center py-3 text-sm text-muted-foreground">
        Hover over a pixel on either image to see the convolution computation
      </div>
    );
  }

  const { pixel, computation } = hoverState;
  const { result, steps, kernel } = computation;
  const kernelSize = kernel.length;
  const offset = Math.floor(kernelSize / 2);

  // Reshape flat steps into 2D grid, handling boundary pixels
  // ConvolutionProcessor.calculateAtPixel skips out-of-bounds, so steps may be sparse
  const grid = [];
  let stepIdx = 0;

  for (let ky = 0; ky < kernelSize; ky++) {
    grid[ky] = [];
    for (let kx = 0; kx < kernelSize; kx++) {
      const px = pixel.x + kx - offset;
      const py = pixel.y + ky - offset;

      if (stepIdx < steps.length &&
          steps[stepIdx].position.x === px &&
          steps[stepIdx].position.y === py) {
        grid[ky][kx] = { ...steps[stepIdx], outOfBounds: false };
        stepIdx++;
      } else {
        grid[ky][kx] = {
          pixel: { r: 0, g: 0, b: 0 },
          kernelValue: kernel[ky][kx],
          position: { x: px, y: py },
          outOfBounds: true
        };
      }
    }
  }

  const fmtWeight = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2);

  const content = (
    <>
      {/* Structured NxN computation grid with parentheses */}
      <div className="flex items-center justify-center gap-0.5">
        {/* Left parenthesis */}
        <span className="text-4xl font-extralight text-muted-foreground self-stretch flex items-center leading-none select-none">
          (
        </span>

        {/* Grid of cells: pixel value + kernel weight */}
        <div className="flex flex-col gap-0.5">
          {grid.map((row, ky) => (
            <div key={ky} className="flex items-center gap-0.5">
              {row.map((cell, kx) => {
                const isCenter = kx === offset && ky === offset;
                return (
                  <div key={kx} className="flex items-center gap-0.5">
                    {/* Plus sign between cells (not before first in row) */}
                    {kx > 0 && (
                      <span className="text-[10px] text-muted-foreground select-none">+</span>
                    )}
                    <div
                      className={cn(
                        "flex flex-col items-center px-1 py-0.5 rounded text-xs font-mono",
                        cell.outOfBounds
                          ? "bg-muted/30 text-muted-foreground/50"
                          : "bg-muted text-foreground",
                        isCenter && "ring-1 ring-primary"
                      )}
                      style={{ minWidth: isGrayscale
                        ? (kernelSize <= 3 ? '48px' : kernelSize <= 5 ? '36px' : '28px')
                        : (kernelSize <= 3 ? '62px' : kernelSize <= 5 ? '48px' : '36px')
                      }}
                    >
                      {isGrayscale ? (
                        <span className="font-semibold">{cell.pixel.r}</span>
                      ) : (
                        <div className="flex gap-0.5 font-semibold text-[10px]">
                          <span className="text-red-500">{cell.pixel.r}</span>
                          <span className="text-muted-foreground">,</span>
                          <span className="text-green-600">{cell.pixel.g}</span>
                          <span className="text-muted-foreground">,</span>
                          <span className="text-blue-500">{cell.pixel.b}</span>
                        </div>
                      )}
                      <span className="text-muted-foreground text-[10px]">
                        ×{fmtWeight(cell.kernelValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right parenthesis */}
        <span className="text-4xl font-extralight text-muted-foreground self-stretch flex items-center leading-none select-none">
          )
        </span>
      </div>

      {/* Result */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-lg font-mono text-muted-foreground">=</span>
        <div
          className="w-6 h-6 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: `rgb(${result.r}, ${result.g}, ${result.b})` }}
        />
        {isGrayscale ? (
          <span className="text-lg font-bold font-mono text-primary">
            {result.r}
          </span>
        ) : (
          <span className="text-sm font-bold font-mono">
            (<span className="text-red-500">{result.r}</span>,{' '}
            <span className="text-green-600">{result.g}</span>,{' '}
            <span className="text-blue-500">{result.b}</span>)
          </span>
        )}
      </div>

      {/* Kernel name */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          kernel: {kernelName}
        </span>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-2 flex flex-col items-center">
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
      <CardContent className="p-3 flex flex-col items-center">
        {content}
      </CardContent>
    </Card>
  );
}

export default ComputationDisplay;
