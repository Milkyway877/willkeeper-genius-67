
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, Shield, Users, AlertCircle } from 'lucide-react';
import { DeliveryTrigger } from '../../types';
import { cn } from '@/lib/utils';

interface TankDeliverySettingsProps {
  deliveryType: DeliveryTrigger;
  deliveryDate?: Date | null;
  recipientEmail?: string;
  onDateChange: (date: Date) => void;
  onEmailChange?: (email: string) => void;
}

export const TankDeliverySettings: React.FC<TankDeliverySettingsProps> = ({ 
  deliveryType, 
  deliveryDate,
  recipientEmail = '',
  onDateChange,
  onEmailChange
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
        <div className="space-y-4">
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
                  This is where your message will be delivered after your passing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Posthumous Delivery Information Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">How Posthumous Delivery Works</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Your message will be automatically delivered when our death verification system confirms your passing. No specific date is required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Death Verification Process */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Death Verification Process
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Automated Monitoring</p>
                    <p>Our system monitors for inactivity and missed check-ins</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Trusted Contact Verification</p>
                    <p>Multiple trusted contacts confirm the situation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Document Verification</p>
                    <p>Official documentation is reviewed when available</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600 mt-0.5">✓</div>
                  <div>
                    <p className="font-medium">Message Delivery</p>
                    <p>Your message is securely delivered to the recipient</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trusted Contacts Setup */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-2">Trusted Contacts Required</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    For posthumous delivery to work reliably, you'll need to set up trusted contacts who can verify your passing. This ensures your messages are delivered at the right time.
                  </p>
                  <p className="text-xs text-amber-700">
                    You can configure trusted contacts in your account settings after creating this message.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
