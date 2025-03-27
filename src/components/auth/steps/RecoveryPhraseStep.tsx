
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RecoveryPhraseInputs, recoveryPhraseSchema } from '../SignUpSchemas';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';

interface RecoveryPhraseStepProps {
  recoveryPhrase: string[];
  verificationIndices: number[];
  onNext: (data: RecoveryPhraseInputs) => void;
}

export function RecoveryPhraseStep({ recoveryPhrase, verificationIndices, onNext }: RecoveryPhraseStepProps) {
  const form = useForm<RecoveryPhraseInputs>({
    resolver: zodResolver(recoveryPhraseSchema),
    defaultValues: {
      verificationWords: {},
    },
  });

  const handleSubmit = (data: RecoveryPhraseInputs) => {
    const isValid = verificationIndices.every((index, i) => {
      const key = `word${i}`;
      return data.verificationWords[key]?.toLowerCase() === recoveryPhrase[index]?.toLowerCase();
    });
    
    if (isValid) {
      onNext(data);
    } else {
      toast({
        title: "Verification failed",
        description: "The words you entered don't match your recovery phrase. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div key="step4" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Your Recovery Phrase</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Write down and safely store these 12 words. They will be used for account recovery.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {recoveryPhrase.map((word, index) => (
                <div key={index} className="relative border rounded p-2 text-center bg-slate-50">
                  <span className="text-xs text-muted-foreground absolute top-1 left-1">{index + 1}</span>
                  <span className="font-mono">{word}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6">
              <p className="text-sm text-amber-800">
                <b>Security Notice:</b> WillTank does NOT store this phrase. You must keep it safe.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To verify you've saved your recovery phrase, please enter the following words:
            </p>
            
            <div className="space-y-4">
              {verificationIndices.map((index, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={`verificationWords.word${i}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word #{index + 1}</FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter word #${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
