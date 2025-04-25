
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormControl } from '@/components/ui/form';

interface HoneypotFieldProps {
  control?: Control<any>;
  name?: string; // Add name prop
}

const HoneypotField: React.FC<HoneypotFieldProps> = ({ control, name = 'honeypot' }) => {
  if (control) {
    // For use with react-hook-form
    return (
      <FormField
        control={control}
        name={name}
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
  } else {
    // For use without react-hook-form
    return (
      <div style={{ display: 'none' }}>
        <input
          type="text"
          name={name}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    );
  }
};

export default HoneypotField;
