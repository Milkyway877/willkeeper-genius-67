
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileVideo, Upload, Eye, ArrowRight, AlertTriangle } from 'lucide-react';
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
    };

    launchConfetti();

    // Set session storage to indicate we have a newly created will
    // This will be used to highlight the will in the dashboard
    sessionStorage.setItem('newlyCreatedWill', will.id);
    
    return () => {
      // Clean up any confetti if needed
    };
  }, [will.id]);

  const handleNavigateToWill = () => {
    navigate(`/will/${will.id}`);
  };

  const handleNavigateToWills = () => {
    navigate('/wills');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl mx-auto animate-fade-in">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 inline-flex mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Your Will Has Been Created!</h2>
            <p className="text-gray-600 mt-2">
              Congratulations! "{will.title}" has been successfully created and is now active.
            </p>
          </div>
          
          {/* Mandatory Next Steps Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Important: Complete Your Will Package</h3>
                <p className="text-sm text-amber-700 mb-3">
                  To ensure your will is comprehensive and legally robust, you must now:
                </p>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li><strong>Record video testimonies</strong> explaining your wishes</li>
                  <li><strong>Upload supporting documents</strong> (property deeds, insurance policies, etc.)</li>
                </ul>
                <p className="text-sm text-amber-700 mt-2 font-medium">
                  These steps are mandatory to complete your estate planning process.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleNavigateToWill} 
              className="w-full flex items-center justify-between bg-willtank-600 hover:bg-willtank-700 text-white text-lg py-4"
            >
              <div className="flex items-center">
                <FileVideo className="mr-3 h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Complete Your Will Package</div>
                  <div className="text-sm opacity-90">Record videos & upload documents</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button 
              onClick={handleNavigateToWill} 
              variant="outline" 
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                <span>View Your Will Details</span>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleNavigateToWills} 
              variant="ghost" 
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                <span>View All My Wills</span>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-3">
              You can always complete the video and document upload steps later, but we strongly recommend doing it now.
            </p>
            
            <Button variant="ghost" size="sm" onClick={handleNavigateToWills}>
              Skip for Now (Not Recommended)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
