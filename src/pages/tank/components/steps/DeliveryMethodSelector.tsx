
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, Trophy, Ghost, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

type DeliveryType = 'date' | 'event' | 'posthumous';

interface DeliveryMethodSelectorProps {
  onSelect: (type: DeliveryType) => void;
}

export const DeliveryMethodSelector = ({ onSelect }: DeliveryMethodSelectorProps) => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const willId = searchParams.get('willId');
  
  // If we're in will mode, automatically select posthumous delivery
  useEffect(() => {
    if (willId) {
      onSelect('posthumous');
      toast({
        title: 'Will Testament',
        description: 'For will testaments, posthumous delivery will be used automatically.'
      });
    }
  }, [willId, onSelect]);
  
  const handleSelect = (type: DeliveryType) => {
    // If we're in will mode, only allow posthumous delivery
    if (willId && type !== 'posthumous') {
      toast({
        title: 'Will Testament Delivery',
        description: 'Will testaments must use posthumous delivery.',
        variant: 'destructive'
      });
      onSelect('posthumous');
      return;
    }
    
    onSelect(type);
    toast({
      title: 'Delivery method selected',
      description: `You've chosen ${type} based delivery.`
    });
  };
  
  const deliveryMethods = [
    {
      type: 'date' as DeliveryType,
      title: 'Date-Based Delivery',
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Schedule delivery for a specific future date',
      features: [
        'Perfect for birthdays and anniversaries',
        'Exact date and time selection',
        'Optional recurring delivery'
      ]
    },
    {
      type: 'event' as DeliveryType,
      title: 'Event-Based Delivery',
      icon: Trophy,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      description: 'Trigger delivery based on life milestones',
      features: [
        'Graduation, marriage, or new baby',
        'Verified by trusted contacts',
        'Optional backup date settings'
      ]
    },
    {
      type: 'posthumous' as DeliveryType,
      title: 'Posthumous Delivery',
      icon: Ghost,
      iconBg: willId ? 'bg-green-100' : 'bg-purple-100',
      iconColor: willId ? 'text-green-600' : 'text-purple-600',
      description: 'Messages delivered after your passing',
      features: [
        'Multi-layered verification system',
        'Integration with legal documents',
        'Trusted contact confirmation'
      ],
      recommended: !!willId
    }
  ];

  return (
    <div className="space-y-4">
      {willId && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Will Testament Delivery</p>
              <p className="text-sm text-amber-700">
                Video testaments for wills must use posthumous delivery. Please select the posthumous delivery option below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deliveryMethods.map(({ type, title, icon: Icon, iconBg, iconColor, description, features, recommended }) => (
          <Card 
            key={type}
            className={`cursor-pointer hover:shadow-md transition-all ${
              recommended ? 'border-2 border-green-400 ring-2 ring-green-200' : 'border-2 hover:border-willtank-300'
            } ${willId && type !== 'posthumous' ? 'opacity-50' : ''}`}
            onClick={() => handleSelect(type)}
          >
            <CardHeader>
              <div className="flex items-center mb-2">
                <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center mr-3`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <CardTitle>{title}</CardTitle>
                {recommended && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
