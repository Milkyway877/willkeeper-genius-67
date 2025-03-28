
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WillTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  sample: string;
  tags: string[];
}

interface TemplateCardProps {
  template: WillTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}

export function TemplateCard({ 
  template,
  isSelected,
  onSelect,
  onPreview
}: TemplateCardProps) {
  
  // Extract complexity from tags - assume first tag is complexity level
  const complexity = template.tags[0]?.toLowerCase() || 'standard';
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'simple':
      case 'basic':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'standard':
      case 'comprehensive':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'complex':
      case 'advanced':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  return (
    <Card className={cn(
      "h-full flex flex-col transition-all duration-200",
      isSelected && "ring-2 ring-willtank-500 shadow-md"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {template.icon && <div className="text-willtank-600">{template.icon}</div>}
            <CardTitle className="text-lg font-semibold">{template.title}</CardTitle>
          </div>
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
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {template.tags.slice(1).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between gap-2 border-t">
        {onPreview && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        )}
        <Button 
          size="sm" 
          className="flex-1"
          onClick={onSelect}
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? (
            <>Selected</>
          ) : (
            <>Use <ArrowRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
