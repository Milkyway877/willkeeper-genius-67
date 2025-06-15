
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowRight, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SimpleWillUnlock() {
  const [executorName, setExecutorName] = useState('');
  const [executorEmail, setExecutorEmail] = useState('');
  const [deceasedEmail, setDeceasedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'success'>('input');
  const { toast } = useToast();

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executorName.trim() || !executorEmail.trim() || !deceasedEmail.trim()) {
      toast({
        title: 'All fields required',
        description: 'Please enter your name, email, and the deceased person\'s email.',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL || ""}/functions/v1/executor-will-unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_access',
          executorName,
          executorEmail,
          deceasedEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('success');
        toast({
          title: 'Access code sent!',
          description: 'Check your email for the OTP code. Continue the verification process as instructed.',
          variant: 'success'
        });
      } else {
        toast({
          title: 'Request failed',
          description: data.error || 'Could not send access code. Please check your info or try again.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Failed to contact the verification server. Please try again or contact support.',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-willtank-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Executor Access</h1>
          <p className="text-gray-600 mt-2">
            Request a code to unlock the will of a deceased person.<br />
            Please enter all information exactly as you were given it.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Request Access Code
            </CardTitle>
            <p className="text-sm text-gray-600">Step 1 of 4: Deceased verification</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'input' ? (
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Executor)</label>
                  <Input
                    value={executorName}
                    onChange={e => setExecutorName(e.target.value)}
                    placeholder="e.g. Mary Johnson"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email Address</label>
                  <Input
                    value={executorEmail}
                    onChange={e => setExecutorEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deceased Person's Email</label>
                  <Input
                    value={deceasedEmail}
                    onChange={e => setDeceasedEmail(e.target.value)}
                    placeholder="their@email.com"
                    disabled={loading}
                    type="email"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Requesting...
                    </span>
                  ) : (
                    <>
                      Request Access Code
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  We will send a secure code to your email if the information matches.
                </p>
              </form>
            ) : (
              <div className="text-center py-10">
                <h2 className="text-lg font-semibold text-green-600 mb-2">Request Submitted!</h2>
                <p className="text-gray-700 mb-4">
                  If a match is found, an access code was sent to your email address.<br />
                  Please check your inbox (and spam folder).
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="mt-2"
                >
                  Try Another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
