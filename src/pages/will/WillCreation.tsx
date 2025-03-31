
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { WillEditor } from './components/WillEditor';
import { WillPreview } from './components/WillPreview';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function WillCreation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [willContent, setWillContent] = useState<string>('');
  const [willData, setWillData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchWillData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('wills')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setWillData(data);
        setWillContent(data.content || 'Start writing your will here...');
      } catch (error: any) {
        console.error('Error fetching will:', error);
        toast({
          title: 'Error loading will',
          description: error.message || 'Could not load will data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWillData();
  }, [id, toast]);
  
  const handleContentChange = (content: string) => {
    setWillContent(content);
  };
  
  const handleSave = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('No authenticated user found');
      }
      
      if (id) {
        // Update existing will
        const { error } = await supabase
          .from('wills')
          .update({
            content: willContent,
            updated_at: new Date(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: 'Will updated',
          description: 'Your will has been updated successfully',
        });
      } else {
        // Create new will
        const { data, error } = await supabase
          .from('wills')
          .insert([
            {
              user_id: userData.user.id,
              title: 'My Will',
              content: willContent,
              status: 'Draft',
            },
          ])
          .select();
        
        if (error) throw error;
        
        toast({
          title: 'Will created',
          description: 'Your will has been created successfully',
        });
        
        if (data && data[0]) {
          navigate(`/will/${data[0].id}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving will:', error);
      toast({
        title: 'Error saving will',
        description: error.message || 'Could not save will',
        variant: 'destructive',
      });
    }
  };
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([willContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `will_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {id ? 'Edit Your Will' : 'Create Your Will'}
          </h1>
          <p className="text-gray-600">
            {id
              ? 'Make updates to your existing will document.'
              : 'Create a new will document to protect your legacy.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WillEditor content={willContent} onChange={handleContentChange} />
          <WillPreview 
            content={willContent} 
            willId={id} 
            onDownload={handleDownload} 
          />
        </div>
      </div>
    </Layout>
  );
}
