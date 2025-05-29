
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Shield, Clock, Users, Key, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VerificationRequest {
  id: string;
  status: string;
  initiated_at: string;
  verification_result?: string;
  verification_details?: any;
}

interface VerificationLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

export function VerificationStatusMonitor() {
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('verification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'death_verification_requests'
        },
        () => fetchVerificationData()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'death_verification_logs'
        },
        () => fetchVerificationData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVerificationData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get latest verification request
      const { data: request } = await supabase
        .from('death_verification_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('initiated_at', { ascending: false })
        .limit(1)
        .single();

      setVerificationRequest(request);

      // Get verification logs
      const { data: logsData } = await supabase
        .from('death_verification_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setLogs(logsData || []);
    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated': return <Clock className="h-4 w-4" />;
      case 'will_unlocked': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="outline" className="text-amber-600">In Progress</Badge>;
      case 'will_unlocked':
        return <Badge variant="outline" className="text-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'verification_triggered': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'trusted_contact_alerted': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'unlock_pins_generated': return <Key className="h-4 w-4 text-purple-600" />;
      case 'will_unlocked_successfully': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verificationRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No active verification processes. Your check-in system is working normally.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(verificationRequest.status)}
              <span className="ml-2">Death Verification Status</span>
            </div>
            {getStatusBadge(verificationRequest.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Started</p>
              <p className="text-sm">{format(new Date(verificationRequest.initiated_at), 'PPp')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-sm capitalize">{verificationRequest.status.replace('_', ' ')}</p>
            </div>
          </div>

          {verificationRequest.status === 'initiated' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The death verification process has been triggered due to missed check-ins. 
                Trusted contacts have been notified to check on your welfare.
              </AlertDescription>
            </Alert>
          )}

          {verificationRequest.status === 'will_unlocked' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your digital will has been successfully unlocked using the 10-way PIN system. 
                The executor now has access to your will contents.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Verification Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActionIcon(log.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(log.created_at), 'PPp')}
                  </p>
                  {log.details && (
                    <p className="text-xs text-gray-600 mt-1">
                      {log.details.contact_email && `Contacted: ${log.details.contact_email}`}
                      {log.details.total_pins && `Generated ${log.details.total_pins} PIN codes`}
                      {log.details.pins_used && `Used ${log.details.pins_used} PIN codes`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
