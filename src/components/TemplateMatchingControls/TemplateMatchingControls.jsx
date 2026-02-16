import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

function TemplateMatchingControls({ animationState }) {
  if (!animationState) return null;

  const {
    matchThreshold,
    setMatchThreshold,
    maxMatches,
    setMaxMatches,
    limitMatches,
    setLimitMatches,
    matchedRegions,
    isComplete
  } = animationState;

  const matchCount = matchedRegions?.length || 0;
  const allMatchesAboveThreshold = animationState.allScores?.filter(item => item.score >= matchThreshold).length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          Match Settings
          {isComplete && matchCount === 0 && (
            <Badge variant="destructive" className="text-xs">No matches</Badge>
          )}
          {isComplete && matchCount > 0 && (
            <Badge variant="default" className="text-xs bg-green-500">{matchCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info message */}
        {!isComplete && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Adjust these settings to control which matches are highlighted. Changes apply in real-time.
            </p>
          </div>
        )}

        {/* No matches warning */}
        {isComplete && matchCount === 0 && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-medium">No matches found!</p>
              <p className="mt-1">Try lowering the <strong>Match Threshold</strong> below to find potential matches.</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {isComplete && matchCount > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-300">
              Found {allMatchesAboveThreshold} match{allMatchesAboveThreshold !== 1 ? 'es' : ''} above threshold
              {limitMatches && allMatchesAboveThreshold > maxMatches && ` (showing top ${maxMatches})`}
            </p>
          </div>
        )}
        {/* Match Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Match Threshold</label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {Math.round((matchThreshold / 255) * 100)}%
            </span>
          </div>
          <Slider
            value={[matchThreshold]}
            onValueChange={(val) => setMatchThreshold(val[0])}
            min={0}
            max={255}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Minimum similarity score to highlight a match
          </p>
        </div>

        <Separator />

        {/* Limit Matches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="limit-matches" className="text-sm font-medium cursor-pointer">
              Limit to top matches
            </label>
            <Switch
              id="limit-matches"
              checked={limitMatches}
              onCheckedChange={setLimitMatches}
            />
          </div>

          {limitMatches && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Max matches to show</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxMatches}
                onChange={(e) => setMaxMatches(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Display only the best {maxMatches} match{maxMatches !== 1 ? 'es' : ''}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Match Count Display */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{matchCount}</span> match{matchCount !== 1 ? 'es' : ''} found
          </p>
          {limitMatches && matchCount > maxMatches && (
            <p className="text-xs text-muted-foreground">
              Showing top {maxMatches}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplateMatchingControls;
