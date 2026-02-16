import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

function InfoPanel({ title, description, explanation, formula }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 ml-4 shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Less' : 'Learn more'}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-border">
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-3 mb-3">
              {explanation}
            </div>
            {formula && (
              <div className="bg-muted p-3 rounded-md">
                <span className="font-semibold text-sm">Formula: </span>
                <code className="text-primary text-sm font-mono">{formula}</code>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default InfoPanel;
