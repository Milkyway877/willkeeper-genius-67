
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, Trophy, Ghost } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DeliveryType = 'date' | 'event' | 'posthumous';

interface DeliveryMethodSelectorProps {
  onSelect: (type: DeliveryType) => void;
}

export const DeliveryMethodSelector = ({ onSelect }: DeliveryMethodSelectorProps) => {
  const { toast } = useToast();
  
  const handleSelect = (type: DeliveryType) => {
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
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Messages delivered after your passing',
      features: [
        'Multi-layered verification system',
        'Integration with legal documents',
        'Trusted contact confirmation'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {deliveryMethods.map(({ type, title, icon: Icon, iconBg, iconColor, description, features }) => (
        <Card 
          key={type}
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-willtank-300"
          onClick={() => handleSelect(type)}
        >
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center mr-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <CardTitle>{title}</CardTitle>
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
  );
};
