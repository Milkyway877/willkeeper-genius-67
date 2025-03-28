
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  title: string;
  description: string;
  complexity: 'simple' | 'standard' | 'complex';
  popularity?: number;
  onUse: () => void;
  onPreview: () => void;
}

export function TemplateCard({ 
  title, 
  description, 
  complexity, 
  popularity, 
  onUse,
  onPreview
}: TemplateCardProps) {
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'standard':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'complex':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return '';
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2 text-xs font-medium capitalize",
              getComplexityColor(complexity)
            )}
          >
            {complexity}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {popularity && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>Used by {popularity}+ people</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between gap-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={onUse}
        >
          Use <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
