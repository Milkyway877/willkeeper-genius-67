
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TemplateWillSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function TemplateWillSection({
  title,
  description,
  defaultOpen = false,
  children,
  className,
  icon
}: TemplateWillSectionProps) {
  return (
    <Card className={cn("mb-6", className)}>
      <Accordion type="single" defaultValue={defaultOpen ? title : undefined} collapsible>
        <AccordionItem value={title} className="border-none">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              {icon && <div className="text-willtank-600">{icon}</div>}
              <div>
                <p className="font-medium text-left">{title}</p>
                {description && <p className="text-sm text-muted-foreground text-left">{description}</p>}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0">
              {children}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
