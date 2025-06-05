
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileVideo, Upload, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Will } from "@/services/willService";

interface WillCreationSuccessProps {
  will: Will;
  onClose?: () => void;
}

export function WillCreationSuccess({ will, onClose }: WillCreationSuccessProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Launch confetti when component mounts
    const launchConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D8B75', '#5BBBA3', '#8CD9C7']
      });
      
      // Launch additional confetti bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2D8B75', '#5BBBA3', '#8CD9C7']
        });
      }, 250);
    };

    launchConfetti();

    // Set session storage to highlight the newly created will on dashboard
    sessionStorage.setItem('newlyCreatedWill', will.id);
    
    // Auto-redirect to dashboard after 3 seconds
    const redirectTimer = setTimeout(() => {
      handleNavigateToDashboard();
    }, 3000);
    
    return () => {
      clearTimeout(redirectTimer);
    };
  }, [will.id]);

  const handleNavigateToDashboard = () => {
    navigate('/wills');
  };

  const handleNavigateToWill = () => {
    navigate(`/will/${will.id}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl mx-auto animate-fade-in">
        <CardContent className="p-8 space-y-6 text-center">
          <div className="bg-green-100 rounded-full p-6 inline-flex mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-4">🎉 Congratulations!</h2>
            <h3 className="text-xl font-semibold mb-2">Your Will Has Been Created Successfully!</h3>
            <p className="text-gray-600">
              "{will.title}" has been finalized and is now ready for the next important steps.
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-amber-800 flex items-center justify-center">
              <Upload className="mr-2 h-5 w-5" />
              Complete Your Will Package
            </h4>
            <p className="text-sm text-amber-700">
              To cement your will and ensure its legal validity, you must:
            </p>
            <div className="space-y-2 text-sm text-amber-700">
              <div className="flex items-center">
                <FileVideo className="mr-2 h-4 w-4" />
                <span>Record a video testament explaining your wishes</span>
              </div>
              <div className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload supporting documents and identification</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleNavigateToWill}
              className="w-full bg-willtank-600 hover:bg-willtank-700 text-white"
            >
              <div className="flex items-center justify-center">
                <span>Complete Video & Documents Now</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Button>
            
            <Button 
              onClick={handleNavigateToDashboard}
              variant="outline" 
              className="w-full"
            >
              Go to Dashboard (Auto-redirecting in 3s...)
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>
              Your will is saved and you can complete these mandatory steps anytime from your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
