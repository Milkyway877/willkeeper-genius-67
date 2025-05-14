
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DeliveryTrigger, FrequencyInterval } from '../../types';
import { cn } from '@/lib/utils';

interface TankDeliverySettingsProps {
  deliveryType: DeliveryTrigger;
  deliveryDate?: Date | null;
  recipientEmail?: string;
  frequency?: FrequencyInterval;
  isCheckIn?: boolean;
  onDateChange: (date: Date) => void;
  onEmailChange?: (email: string) => void;
  onFrequencyChange?: (frequency: FrequencyInterval) => void;
}

export const TankDeliverySettings: React.FC<TankDeliverySettingsProps> = ({ 
  deliveryType, 
  deliveryDate,
  recipientEmail = '',
  frequency = 'monthly',
  isCheckIn = false,
  onDateChange,
  onEmailChange,
  onFrequencyChange
}) => {
  const date = deliveryDate || new Date();
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      onDateChange(newDate);
    }
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onEmailChange) {
      onEmailChange(e.target.value);
    }
  };
  
  const handleFrequencyChange = (value: FrequencyInterval) => {
    if (onFrequencyChange) {
      onFrequencyChange(value);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Configure Delivery Settings</h2>
      
      {deliveryType === 'date' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient_email" className="block mb-2">Recipient Email Address</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  placeholder="example@email.com"
                  value={recipientEmail}
                  onChange={handleEmailChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is where your message will be delivered on the scheduled date.
                </p>
              </div>
              
              <div>
                <Label className="block mb-2">Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  Your message will be delivered on this date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {deliveryType === 'event' && (
        <Card>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="recipient_email" className="block mb-2">Recipient Email Address</Label>
              <Input
                id="recipient_email"
                type="email"
                placeholder="example@email.com"
                value={recipientEmail}
                onChange={handleEmailChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is where your message will be delivered when the trigger event occurs.
              </p>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Event-based delivery allows your message to be sent when a specific life event occurs. This feature requires additional setup with trusted contacts who can verify the event.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {deliveryType === 'posthumous' && (
        <Card>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="recipient_email" className="block mb-2">Recipient Email Address</Label>
              <Input
                id="recipient_email"
                type="email"
                placeholder="example@email.com"
                value={recipientEmail}
                onChange={handleEmailChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is where your message will be delivered posthumously.
              </p>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Posthumous delivery uses our secure verification system to authenticate and deliver your messages after your passing. This feature requires additional security verification and trusted contacts setup.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {deliveryType === 'recurring' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient_email" className="block mb-2">Check-In Email Address</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  placeholder="your@email.com"
                  value={recipientEmail}
                  onChange={handleEmailChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is where the check-in messages will be sent. You'll need to respond to confirm your well-being.
                </p>
              </div>
              
              <div>
                <Label htmlFor="frequency" className="block mb-2">Check-In Frequency</Label>
                <Select 
                  value={frequency} 
                  onValueChange={(value: FrequencyInterval) => handleFrequencyChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Every 3 months</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  How often do you want to receive check-in requests?
                </p>
              </div>
              
              <div>
                <Label className="block mb-2">First Check-In Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  When would you like to receive your first check-in?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
