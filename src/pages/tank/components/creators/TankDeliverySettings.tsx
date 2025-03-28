
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Trophy, 
  Ghost, 
  Check, 
  User, 
  Plus,
  Mail,
  Shield,
  BellRing,
  Lock,
  Info,
  AlarmClock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeliveryTrigger } from '../../types';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface TankDeliverySettingsProps {
  deliveryType: DeliveryTrigger | null;
  onDateChange: (date: string) => void;
}

export const TankDeliverySettings: React.FC<TankDeliverySettingsProps> = ({ 
  deliveryType,
  onDateChange
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('12:00');
  const [milestone, setMilestone] = useState<string>('');
  const [verifiers, setVerifiers] = useState<string[]>([]);
  const [newVerifier, setNewVerifier] = useState<string>('');
  const [sendReminders, setSendReminders] = useState<boolean>(true);
  const [requireConfirmation, setRequireConfirmation] = useState<boolean>(true);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [recurringDelivery, setRecurringDelivery] = useState<boolean>(false);
  const [recurringInterval, setRecurringInterval] = useState<string>('yearly');
  const [recurringCount, setRecurringCount] = useState<number>(5);
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      onDateChange(`${formattedDate}T${time}`);
    }
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onDateChange(`${formattedDate}T${e.target.value}`);
    }
  };
  
  const handleMilestoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMilestone(e.target.value);
  };
  
  const handleNewVerifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVerifier(e.target.value);
  };
  
  const addVerifier = () => {
    if (newVerifier.trim() !== '' && !verifiers.includes(newVerifier.trim())) {
      setVerifiers([...verifiers, newVerifier.trim()]);
      setNewVerifier('');
      
      toast({
        title: "Verifier Added",
        description: `${newVerifier.trim()} has been added as a verifier.`
      });
    }
  };
  
  const removeVerifier = (verifierToRemove: string) => {
    setVerifiers(verifiers.filter(v => v !== verifierToRemove));
    
    toast({
      title: "Verifier Removed",
      description: `${verifierToRemove} has been removed as a verifier.`
    });
  };
  
  const handleCustomMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(e.target.value);
  };
  
  const getDeliveryTypeTitle = () => {
    switch (deliveryType) {
      case 'date':
        return 'Date-Based Delivery';
      case 'event':
        return 'Event-Based Delivery';
      case 'posthumous':
        return 'Posthumous Delivery';
      default:
        return 'Delivery Settings';
    }
  };
  
  const getDeliveryTypeIcon = () => {
    switch (deliveryType) {
      case 'date':
        return <Calendar className="mr-2 h-5 w-5 text-blue-500" />;
      case 'event':
        return <Trophy className="mr-2 h-5 w-5 text-amber-500" />;
      case 'posthumous':
        return <Ghost className="mr-2 h-5 w-5 text-purple-500" />;
      default:
        return <Calendar className="mr-2 h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              {getDeliveryTypeIcon()}
              {getDeliveryTypeTitle()}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {deliveryType === 'date' && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Select Delivery Date</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div>
                      <Label htmlFor="deliveryTime" className="mb-2 block">Delivery Time</Label>
                      <Input
                        id="deliveryTime"
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={recurringDelivery}
                    onCheckedChange={setRecurringDelivery}
                  />
                  <Label htmlFor="recurring">Make this a recurring delivery</Label>
                </div>
                
                {recurringDelivery && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label htmlFor="recurringInterval" className="mb-2 block">Repeat Every</Label>
                      <Select 
                        value={recurringInterval} 
                        onValueChange={setRecurringInterval}
                      >
                        <SelectTrigger id="recurringInterval">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yearly">Year</SelectItem>
                          <SelectItem value="monthly">Month</SelectItem>
                          <SelectItem value="weekly">Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="recurringCount" className="mb-2 block">Repeat Count</Label>
                      <Input
                        id="recurringCount"
                        type="number"
                        min={1}
                        max={10}
                        value={recurringCount}
                        onChange={(e) => setRecurringCount(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {deliveryType === 'event' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="milestone" className="mb-2 block">Milestone or Event</Label>
                  <Input
                    id="milestone"
                    placeholder="e.g. Graduation, Wedding, Retirement"
                    value={milestone}
                    onChange={handleMilestoneChange}
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Event Verifiers</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Add people who can verify when the milestone occurs to trigger delivery
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {verifiers.map((verifier) => (
                      <Badge key={verifier} variant="outline" className="flex items-center gap-1 px-3 py-1">
                        <User size={12} className="mr-1" />
                        {verifier}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-red-500"
                          onClick={() => removeVerifier(verifier)}
                        >
                          <span className="sr-only">Remove</span>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Button>
                      </Badge>
                    ))}
                    
                    {verifiers.length === 0 && (
                      <p className="text-sm text-gray-500">No verifiers added yet</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter name or email of verifier"
                      value={newVerifier}
                      onChange={handleNewVerifierChange}
                      className="flex-grow"
                    />
                    <Button variant="outline" onClick={addVerifier}>
                      <Plus size={16} className="mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-amber-50">
                  <div className="flex items-start">
                    <Info size={18} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800 mb-1">How Event Verification Works</h3>
                      <p className="text-sm text-amber-700">
                        When the milestone occurs, your designated verifiers will receive an email to confirm the event. Once verified by at least 2 people, your message will be delivered to the recipient.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {deliveryType === 'posthumous' && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex items-start">
                    <Info size={18} className="text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-purple-800 mb-1">Posthumous Delivery System</h3>
                      <p className="text-sm text-purple-700 mb-2">
                        This special delivery system will only release your message after your passing, verified through multiple checks:
                      </p>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li className="flex items-start">
                          <Check size={14} className="text-purple-600 mr-1 mt-0.5" />
                          Regular check-in prompts sent to your account
                        </li>
                        <li className="flex items-start">
                          <Check size={14} className="text-purple-600 mr-1 mt-0.5" />
                          Verification by designated trusted contacts
                        </li>
                        <li className="flex items-start">
                          <Check size={14} className="text-purple-600 mr-1 mt-0.5" />
                          Optional legal document verification
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Trusted Contacts</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Add people who can verify your passing to authorize message delivery
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {verifiers.map((verifier) => (
                      <Badge key={verifier} variant="outline" className="flex items-center gap-1 px-3 py-1">
                        <User size={12} className="mr-1" />
                        {verifier}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-red-500"
                          onClick={() => removeVerifier(verifier)}
                        >
                          <span className="sr-only">Remove</span>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Button>
                      </Badge>
                    ))}
                    
                    {verifiers.length === 0 && (
                      <p className="text-sm text-amber-500">At least two trusted contacts are required</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter name or email of trusted contact"
                      value={newVerifier}
                      onChange={handleNewVerifierChange}
                      className="flex-grow"
                    />
                    <Button variant="outline" onClick={addVerifier}>
                      <Plus size={16} className="mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Verification Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="legalDocumentVerification"
                        checked={true}
                        disabled
                      />
                      <Label htmlFor="legalDocumentVerification">Require trusted contact verification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="legalDocumentVerification"
                        checked={true}
                      />
                      <Label htmlFor="legalDocumentVerification">Require legal document verification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="accountInactivity"
                        checked={true}
                      />
                      <Label htmlFor="accountInactivity">Detect extended account inactivity (90+ days)</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Mail className="mr-2 h-5 w-5 text-willtank-600" />
              Delivery Message
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Textarea
              placeholder="Add a custom message that will be included with your delivery notification..."
              className="min-h-[120px] resize-none"
              value={customMessage}
              onChange={handleCustomMessageChange}
            />
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Shield className="mr-2 h-5 w-5 text-willtank-600" />
              Security & Notifications
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Delivery Confirmation</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendReminders"
                    checked={sendReminders}
                    onCheckedChange={setSendReminders}
                  />
                  <Label htmlFor="sendReminders">Send delivery reminders</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireConfirmation"
                    checked={requireConfirmation}
                    onCheckedChange={setRequireConfirmation}
                  />
                  <Label htmlFor="requireConfirmation">Confirm before delivery</Label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-1 text-gray-700" />
                Access Security
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recipient identity verification</span>
                  <Badge variant="outline" className="bg-willtank-50 text-willtank-700">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content encryption</span>
                  <Badge variant="outline" className="bg-willtank-50 text-willtank-700">256-bit AES</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Access expiration</span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-500">None</Badge>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center">
                <BellRing className="h-4 w-4 mr-1 text-gray-700" />
                Notification Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifyOnScheduled"
                    checked={true}
                  />
                  <Label htmlFor="notifyOnScheduled">Notify me when message is scheduled</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifyBeforeDelivery"
                    checked={true}
                  />
                  <Label htmlFor="notifyBeforeDelivery">Notify me before delivery</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifyOnDelivery"
                    checked={true}
                  />
                  <Label htmlFor="notifyOnDelivery">Notify me when delivered</Label>
                </div>
              </div>
            </div>
            
            <div className="bg-willtank-50 p-3 rounded-lg border border-willtank-100">
              <div className="flex items-start">
                <AlarmClock className="h-5 w-5 text-willtank-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-willtank-700">Regular Verification</h3>
                  <p className="text-sm text-willtank-600 mb-1">
                    We'll check with you periodically to ensure your scheduled messages remain relevant.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
