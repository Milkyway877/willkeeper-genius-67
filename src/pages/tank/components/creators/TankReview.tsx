
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Eye, 
  FileText, 
  Video, 
  FileAudio, 
  File, 
  Calendar, 
  Trophy, 
  Ghost, 
  User, 
  Shield, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DeliveryTrigger, MessageType } from '../../types';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface TankReviewProps {
  messageType: MessageType | null;
  title: string;
  recipient: string;
  deliveryType: DeliveryTrigger | null;
  deliveryDate: string;
  onFinalize: () => void;
  isGenerating: boolean;
  progress: number;
}

export const TankReview: React.FC<TankReviewProps> = ({ 
  messageType, 
  title,
  recipient,
  deliveryType,
  deliveryDate,
  onFinalize,
  isGenerating,
  progress
}) => {
  const getTypeIcon = () => {
    switch (messageType) {
      case 'letter':
        return <FileText size={18} className="text-blue-500" />;
      case 'video':
        return <Video size={18} className="text-red-500" />;
      case 'audio':
        return <FileAudio size={18} className="text-purple-500" />;
      case 'document':
        return <File size={18} className="text-green-500" />;
      default:
        return <FileText size={18} />;
    }
  };
  
  const getTypeName = () => {
    switch (messageType) {
      case 'letter':
        return 'Letter';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'document':
        return 'Document';
      default:
        return 'Message';
    }
  };
  
  const getDeliveryIcon = () => {
    switch (deliveryType) {
      case 'date':
        return <Calendar size={18} className="text-blue-500" />;
      case 'event':
        return <Trophy size={18} className="text-amber-500" />;
      case 'posthumous':
        return <Ghost size={18} className="text-purple-500" />;
      default:
        return <Calendar size={18} />;
    }
  };
  
  const getDeliveryName = () => {
    switch (deliveryType) {
      case 'date':
        return 'Date-Based';
      case 'event':
        return 'Event-Based';
      case 'posthumous':
        return 'Posthumous';
      default:
        return 'Delivery';
    }
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };
  
  const verifyDetails = () => {
    // Validation checks
    const issues = [];
    
    if (!title) issues.push('Message title is required');
    if (!recipient) issues.push('Recipient name is required');
    if (deliveryType === 'date' && !deliveryDate) issues.push('Delivery date is required');
    
    return issues;
  };
  
  const validationIssues = verifyDetails();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-willtank-100 mb-4">
          <Check className="h-8 w-8 text-willtank-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Your Future Message</h2>
        <p className="text-gray-600">
          Confirm the details below before finalizing your message for the Tank
        </p>
      </div>
      
      {isGenerating ? (
        <div className="text-center py-10">
          <RefreshCw className="h-12 w-12 text-willtank-600 animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold mb-2">Processing Your Message</h3>
          <p className="text-gray-600 mb-8">
            We're encrypting and securing your future message in the Tank...
          </p>
          
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-gray-500">{progress}% complete</p>
          </div>
        </div>
      ) : (
        <>
          {validationIssues.length > 0 && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-2">Please Address These Issues</h3>
                    <ul className="space-y-1 text-sm text-amber-700">
                      {validationIssues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Message Details</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-center col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {getTypeIcon()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Message Type</p>
                    <p className="font-medium">{getTypeName()}</p>
                  </div>
                </div>
                
                <div className="flex items-center col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-medium">{recipient || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{title || 'Not specified'}</p>
                </div>
                
                <div className="flex items-center col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {getDeliveryIcon()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Method</p>
                    <p className="font-medium">{getDeliveryName()} Delivery</p>
                  </div>
                </div>
                
                <div className="flex items-center col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Date</p>
                    <p className="font-medium">{formatDate(deliveryDate) || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-willtank-600" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">End-to-End Encryption</p>
                    <p className="text-sm text-gray-600">Your message is encrypted using 256-bit AES encryption.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Recipient Verification</p>
                    <p className="text-sm text-gray-600">Identity verification is required before your recipient can access the message.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Access Controls</p>
                    <p className="text-sm text-gray-600">You can modify or delete this message until its delivery date.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Confirmation</p>
                    <p className="text-sm text-gray-600">You'll be notified when your message is delivered.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back & Edit
            </Button>
            
            <Button 
              onClick={onFinalize}
              disabled={validationIssues.length > 0}
              className="bg-willtank-600 hover:bg-willtank-700"
            >
              <Shield className="mr-2 h-4 w-4" />
              Secure in the Tank
            </Button>
          </div>
          
          {validationIssues.length > 0 && (
            <p className="text-center text-sm text-amber-600 mt-4">
              Please resolve the issues above before proceeding
            </p>
          )}
        </>
      )}
    </div>
  );
};
