
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TemplateInputs, templateSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';

interface TemplateStepProps {
  willPreview: string;
  onNext: (data: TemplateInputs) => void;
}

export function TemplateStep({ willPreview, onNext }: TemplateStepProps) {
  const form = useForm<TemplateInputs>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateChoice: '',
    },
  });

  return (
    <motion.div key="step8" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Select Will Template</h3>
            <p className="text-sm text-muted-foreground">
              Choose a template for your will. You can customize it further after sign-up.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="templateChoice"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-4"
                  >
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="standard" className="peer sr-only" id="standard" />
                      </FormControl>
                      <label
                        htmlFor="standard"
                        className="flex flex-col h-full p-4 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3 flex justify-between items-center">
                          <h3 className="text-base font-semibold">Standard Template</h3>
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            Recommended
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm mb-4">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Simple, clear language
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Essential provisions
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Legal compliance
                          </li>
                        </ul>
                        <div className="border p-3 rounded bg-slate-50 text-xs font-mono h-32 overflow-y-auto whitespace-pre-line">
                          {willPreview}
                        </div>
                      </label>
                    </FormItem>
                    
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="detailed" className="peer sr-only" id="detailed" />
                      </FormControl>
                      <label
                        htmlFor="detailed"
                        className="flex flex-col h-full p-4 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3 flex justify-between items-center">
                          <h3 className="text-base font-semibold">Detailed Template</h3>
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                            Premium
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm mb-4">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Comprehensive coverage
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Special provisions
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Advanced planning options
                          </li>
                        </ul>
                        <div className="border p-3 rounded bg-slate-50 text-xs font-mono h-32 overflow-y-auto whitespace-pre-line">
                          {willPreview.replace('ARTICLE', 'CLAUSE').replace('ARTICLE', 'CLAUSE')}
                        </div>
                      </label>
                    </FormItem>
                    
                    <FormItem className="col-span-1">
                      <FormControl>
                        <RadioGroupItem value="business" className="peer sr-only" id="business" />
                      </FormControl>
                      <label
                        htmlFor="business"
                        className="flex flex-col h-full p-4 border rounded-xl cursor-pointer peer-data-[state=checked]:border-willtank-600 peer-data-[state=checked]:bg-willtank-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="mb-3 flex justify-between items-center">
                          <h3 className="text-base font-semibold">Business Owner Template</h3>
                          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                            Specialized
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm mb-4">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Business succession planning
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Asset protection
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-willtank-600" /> Tax planning considerations
                          </li>
                        </ul>
                        <div className="border p-3 rounded bg-slate-50 text-xs font-mono h-32 overflow-y-auto whitespace-pre-line">
                          {willPreview.replace('ARTICLE', 'SECTION').replace('ARTICLE', 'SECTION')}
                        </div>
                      </label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
            <p>These templates are starting points. You'll be able to fully customize your will after completing registration.</p>
          </div>
          
          <Button type="submit" className="w-full">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
