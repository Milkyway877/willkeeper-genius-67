
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormControl } from '@/components/ui/form';

interface HoneypotFieldProps {
  control: Control<any>;
}

const HoneypotField: React.FC<HoneypotFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="honeypot"
      render={({ field }) => (
        <FormItem style={{ display: 'none' }}>
          <FormControl>
            <input
              type="text"
              autoComplete="off"
              tabIndex={-1}
              {...field}
              aria-hidden="true"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default HoneypotField;
