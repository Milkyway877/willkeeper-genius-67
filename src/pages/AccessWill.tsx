
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AccessWill() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleAccessWill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !pin) {
      toast({
        title: "Missing Information",
        description: "Please enter both the email address and PIN code.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify the PIN code
      const { data: pinData, error: pinError } = await supabase
        .from('death_verification_pins')
        .select('person_id')
        .eq('pin_code', pin)
        .eq('used', false)
        .single();
      
      if (pinError || !pinData) {
        toast({
          title: "Invalid PIN",
          description: "The PIN code you entered is invalid or has already been used.",
          variant: "destructive"
        });
        return;
      }
      
      // Get the user profile
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', pinData.person_id)
        .single();
      
      if (userError || !userData) {
        toast({
          title: "User Not Found",
          description: "No user was found with the provided email address.",
          variant: "destructive"
        });
        return;
      }
      
      // Mark the PIN as used
      await supabase
        .from('death_verification_pins')
        .update({ 
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('pin_code', pin);
      
      // Success! Redirect to the will view page
      toast({
        title: "Access Granted",
        description: "You now have access to the will. You are being redirected.",
      });
      
      // In a real application, this would navigate to a will view page with the actual will content
      // For now, we'll redirect to the dashboard
      setTimeout(() => {
        navigate(`/dashboard/will?userId=${pinData.person_id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error accessing will:', error);
      toast({
        title: "Access Error",
        description: "An error occurred while trying to access the will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto my-12">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Access a Will
        </h1>
        
        <Card className="p-6">
          <form onSubmit={handleAccessWill} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address of Deceased</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter the email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Enter the email address of the deceased person.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="text"
                placeholder="Enter the PIN code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Enter the PIN code provided to you as an executor.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Will'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
