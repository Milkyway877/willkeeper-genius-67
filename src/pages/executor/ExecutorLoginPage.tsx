
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog, Info, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ExecutorLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    executorEmail: '',
    userName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.executorEmail.trim() || !formData.userName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your email and the WillTank user's name.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if executor exists with this email
      const { data: executors, error: executorError } = await supabase
        .from('will_executors')
        .select('id, name, email, user_id')
        .ilike('email', formData.executorEmail.trim())
        .order('created_at', { ascending: false });
      
      if (executorError) {
        throw new Error("Error verifying executor: " + executorError.message);
      }
      
      if (!executors || executors.length === 0) {
        toast({
          title: "Executor Not Found",
          description: "We could not find an executor with this email address.",
          variant: "destructive"
        });
        return;
      }
      
      // Check for user name match (approximate match to be flexible with naming formats)
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, full_name')
        .filter('id', 'in', `(${executors.map(e => e.user_id).join(',')})`)
        .order('created_at', { ascending: false });
      
      if (userError) {
        throw new Error("Error verifying user: " + userError.message);
      }
      
      // Find a user with a name similar to what was provided
      const searchName = formData.userName.toLowerCase().trim();
      const matchedUser = users?.find(user => {
        const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return fullName.toLowerCase().includes(searchName) || 
               searchName.includes(fullName.toLowerCase()) ||
               (user.first_name && user.first_name.toLowerCase().includes(searchName)) ||
               (user.last_name && user.last_name.toLowerCase().includes(searchName));
      });
      
      if (!matchedUser) {
        toast({
          title: "User Not Found",
          description: "We could not find a user with this name who has appointed you as an executor.",
          variant: "destructive"
        });
        return;
      }
      
      // Get the matched executor
      const matchedExecutor = executors.find(e => e.user_id === matchedUser.id);
      
      if (!matchedExecutor) {
        toast({
          title: "Relationship Not Found",
          description: "The executor relationship could not be verified.",
          variant: "destructive"
        });
        return;
      }
      
      // Init the executor verification process by calling an edge function
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('init-executor-verification', {
        body: {
          executorId: matchedExecutor.id,
          userId: matchedUser.id,
          executorEmail: formData.executorEmail.trim(),
          userName: formData.userName.trim()
        }
      });
      
      if (verificationError || !verificationData?.success) {
        throw new Error(verificationError?.message || verificationData?.error || "Failed to initiate verification");
      }
      
      // Navigate to PIN entry page with the verification session ID
      navigate(`/executor/verify/${verificationData.verificationId}`);
      
    } catch (error) {
      console.error('Error in executor login:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login attempt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToInfo = () => {
    navigate('/executor/info');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 h-5 w-5 text-willtank-600" />
            Executor Login
          </CardTitle>
          <CardDescription>
            Access a WillTank user's will and documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="executorEmail">Your Email</Label>
                <Input
                  id="executorEmail"
                  name="executorEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.executorEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userName">WillTank User's Name</Label>
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  placeholder="Full name of the deceased"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  Continue to Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={navigateToInfo} className="text-sm">
            <Info className="h-4 w-4 mr-2" />
            Learn about the executor role
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ExecutorLoginPage;
