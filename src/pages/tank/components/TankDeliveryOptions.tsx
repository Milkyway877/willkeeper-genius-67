
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Award, 
  AlertCircle, 
  User, 
  Lock, 
  Info, 
  MessageSquare, 
  Video, 
  Mic, 
  FileText,
  Send 
} from 'lucide-react';

type MessageType = 'letter' | 'video' | 'audio' | 'document';
type DeliveryType = 'date' | 'event' | 'posthumous';

type TankDeliveryOptionsProps = {
  messageType: MessageType;
  onComplete: () => void;
};

export function TankDeliveryOptions({ messageType, onComplete }: TankDeliveryOptionsProps) {
  const { toast } = useToast();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('date');
  const [specificDate, setSpecificDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isAuthenticationRequired, setIsAuthenticationRequired] = useState(true);
  const [passcode, setPasscode] = useState('');
  
  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'letter':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'audio':
        return <Mic className="h-5 w-5 text-red-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-green-500" />;
    }
  };
  
  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case 'letter':
        return 'Future Letter';
      case 'video':
        return 'Future Video';
      case 'audio':
        return 'Future Audio';
      case 'document':
        return 'Future Document';
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!recipient) {
      toast({
        title: "Recipient required",
        description: "Please specify who should receive this message",
        variant: "destructive"
      });
      return;
    }
    
    if (deliveryType === 'date' && !specificDate) {
      toast({
        title: "Date required",
        description: "Please select a delivery date",
        variant: "destructive"
      });
      return;
    }
    
    if (deliveryType === 'event' && !eventType) {
      toast({
        title: "Event required",
        description: "Please specify which event should trigger delivery",
        variant: "destructive"
      });
      return;
    }
    
    if (isAuthenticationRequired && !passcode) {
      toast({
        title: "Passcode required",
        description: "Please set a passcode for recipient authentication",
        variant: "destructive"
      });
      return;
    }
    
    // Handle successful submission
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="mr-3">
            {getTypeIcon(messageType)}
          </div>
          <h3 className="font-medium">{getTypeLabel(messageType)}</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="recipient" className="block mb-2">Recipient</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  id="recipient" 
                  placeholder="Who should receive this message?" 
                  className="pl-10"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Enter the name or email of the recipient</p>
            </div>
            
            <div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Delivery Method</h3>
                <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as DeliveryType)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="date" id="date" />
                    <Label htmlFor="date" className="flex items-center cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2 text-willtank-500" />
                      <span>Specific Date</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="event" id="event" />
                    <Label htmlFor="event" className="flex items-center cursor-pointer">
                      <Award className="h-4 w-4 mr-2 text-willtank-500" />
                      <span>Life Event</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="posthumous" id="posthumous" />
                    <Label htmlFor="posthumous" className="flex items-center cursor-pointer">
                      <AlertCircle className="h-4 w-4 mr-2 text-willtank-500" />
                      <span>Posthumous Delivery</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {deliveryType === 'date' && (
                <div>
                  <Label htmlFor="specific-date" className="block mb-2">Delivery Date</Label>
                  <Input 
                    id="specific-date" 
                    type="date" 
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
              
              {deliveryType === 'event' && (
                <div>
                  <Label htmlFor="event-type" className="block mb-2">Life Event</Label>
                  <select 
                    id="event-type" 
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-willtank-500"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="">Select an event</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding Day</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="graduation">Graduation</option>
                    <option value="retirement">Retirement</option>
                    <option value="newBaby">Birth of Child</option>
                  </select>
                </div>
              )}
              
              {deliveryType === 'posthumous' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      This message will only be delivered after our system confirms your passing.
                      We'll periodically ask for confirmation that you're still with us.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-6 pt-6">
            <h3 className="font-medium mb-4">Security Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Switch 
                  id="encrypted" 
                  checked={isEncrypted}
                  onCheckedChange={setIsEncrypted}
                />
                <div>
                  <Label htmlFor="encrypted" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-willtank-500" />
                    <span>Encrypt this message</span>
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Your message will be encrypted until the delivery date
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Switch 
                  id="authentication" 
                  checked={isAuthenticationRequired}
                  onCheckedChange={setIsAuthenticationRequired}
                />
                <div>
                  <Label htmlFor="authentication" className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-willtank-500" />
                    <span>Require recipient authentication</span>
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    The recipient will need to verify their identity to view the message
                  </p>
                </div>
              </div>
            </div>
            
            {isAuthenticationRequired && (
              <div className="mt-4">
                <Label htmlFor="passcode" className="block mb-2">Recipient Passcode</Label>
                <Input 
                  id="passcode" 
                  type="text" 
                  placeholder="Create a passcode for the recipient" 
                  className="max-w-md"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Share this passcode with the recipient so they can access your message
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          <Send className="h-4 w-4 mr-2" />
          Schedule Message
        </Button>
      </div>
    </form>
  );
}
