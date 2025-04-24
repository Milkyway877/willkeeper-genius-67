
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { WillEditor } from './components/WillEditor';
import { getWill } from '@/services/willService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WillCreationProps {
  readOnly?: boolean;
}

export default function WillCreation({ readOnly = false }: WillCreationProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [willData, setWillData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWillData = async () => {
      if (!id) {
        // No ID means we're creating a new will
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getWill(id);
        
        if (data) {
          setWillData(data);
        } else {
          setError("Will not found");
          toast({
            title: "Error",
            description: "Could not find the requested will",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading will:', error);
        setError("Failed to load will");
        toast({
          title: "Error",
          description: "Failed to load will content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWillData();
  }, [id, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center items-center">
          <Loader2 className="w-10 h-10 text-willtank-600 animate-spin mr-2" />
          <span className="text-lg text-gray-600">Loading will content...</span>
        </div>
      </Layout>
    );
  }

  if (error && id) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">{error}</h3>
            <p className="mt-2 text-sm text-red-700">
              Please try again or select a different will.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WillEditor readOnly={readOnly} willData={willData} willId={id || undefined} />
      </div>
    </Layout>
  );
}
