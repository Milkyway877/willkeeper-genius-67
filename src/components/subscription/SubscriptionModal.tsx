
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const plans = [
  {
    name: 'Starter',
    price: '$7.99',
    period: 'month',
    features: [
      'Basic will templates',
      'Up to 2 future messages',
      'Standard encryption',
      'Email support',
      '5GB document storage'
    ],
    recommended: false,
  },
  {
    name: 'Gold',
    price: '$14.99',
    period: 'month',
    features: [
      'Advanced will templates',
      'Up to 10 future messages',
      'Enhanced encryption',
      'Priority email support',
      '20GB document storage',
      'AI document analysis'
    ],
    recommended: true,
  },
  {
    name: 'Platinum',
    price: '$24.99',
    period: 'month',
    features: [
      'Premium legal templates',
      'Unlimited future messages',
      'Military-grade encryption',
      '24/7 priority support',
      '100GB document storage',
      'Advanced AI tools',
      'Family sharing (up to 5 users)'
    ],
    recommended: false,
  },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  onSubscribe
}) => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    onSubscribe();
    // Navigate to pricing page with selected plan
    navigate(`/pricing?plan=${planName.toLowerCase()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-600" />
            Upgrade to Continue
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Creating your will requires a premium subscription. Choose your plan to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.recommended
                  ? 'border-yellow-500 shadow-lg scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            All plans include a 14-day money-back guarantee
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
