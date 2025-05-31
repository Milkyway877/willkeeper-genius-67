
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUserHasWill } from '@/services/willCheckService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Clock, Users, ArrowLeft } from 'lucide-react';

interface TankAccessGuardProps {
  children: React.ReactNode;
}

export const TankAccessGuard: React.FC<TankAccessGuardProps> = ({ children }) => {
  const [hasWill, setHasWill] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkWillStatus = async () => {
      try {
        const result = await checkUserHasWill();
        setHasWill(result.hasWill);
      } catch (error) {
        console.error('Error checking will status:', error);
        setHasWill(false);
      } finally {
        setLoading(false);
      }
    };

    checkWillStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!hasWill) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl text-amber-800">Create Your Will First</CardTitle>
              <CardDescription className="text-amber-700">
                You need to create a will before you can access the Tank features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-3">Why create a will first?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Future Messages</p>
                      <p className="text-sm text-amber-700">Tank messages are tied to your will for legal compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Recipient Management</p>
                      <p className="text-sm text-amber-700">Your will defines who can receive your future messages</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 px-6 py-3"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Dashboard
                  </Button>
                  <Button 
                    onClick={() => navigate('/will/create')}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                    size="lg"
                  >
                    Create Your Will Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-amber-600">
                  It only takes a few minutes to get started
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
