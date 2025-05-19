
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { getFutureMessages, checkScheduledMessages, sendStatusChecks } from '@/services/tankService';
import { RefreshCw, Check, AlertTriangle, Bell, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FrequencyInterval } from '../types';

export const TankAnalytics = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [sendingStatusChecks, setSendingStatusChecks] = useState(false);
  
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['futureMessages'],
    queryFn: getFutureMessages
  });

  const handleCheckScheduled = async () => {
    setIsChecking(true);
    try {
      const result = await checkScheduledMessages();
      
      if (result) {
        toast({
          title: "Check Complete",
          description: `Processed ${result.processed} messages: ${result.successful} successful, ${result.failed} failed.`
        });
        
        // Refresh the message list
        refetch();
      } else {
        toast({
          title: "Check Failed",
          description: "Could not process scheduled messages",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking scheduled messages:', error);
      toast({
        title: "Error",
        description: "Failed to check scheduled messages",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleSendStatusChecks = async () => {
    setSendingStatusChecks(true);
    try {
      const success = await sendStatusChecks();
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to send status checks. Please try again.",
          variant: "destructive"
        });
      }
      
      // No need for success toast as it's handled in the service
    } catch (error) {
      console.error('Error sending status checks:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSendingStatusChecks(false);
    }
  };

  // Calculate message statistics
  const messageStats = React.useMemo(() => {
    const stats = {
      total: messages.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      checkInStats: {
        total: 0,
        active: 0,
        responded: 0,
        byFrequency: {} as Record<string, number>
      }
    };
    
    messages.forEach(msg => {
      // Count by type
      const type = msg.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by status
      const status = msg.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Count by category
      const category = msg.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Check-in specific stats
      if (msg.type === 'check-in') {
        stats.checkInStats.total++;
        
        if (msg.status === 'delivered' || msg.status === 'scheduled') {
          stats.checkInStats.active++;
        }
        
        if (msg.messageUrl) {
          // Using messageUrl to track last response for check-ins
          stats.checkInStats.responded++;
        }
        
        // Count by frequency
        const frequency = msg.frequency || 'unknown';
        stats.checkInStats.byFrequency[frequency] = 
          (stats.checkInStats.byFrequency[frequency] || 0) + 1;
      }
    });
    
    return stats;
  }, [messages]);

  // Prepare data for charts
  const typeChartData = React.useMemo(() => {
    return Object.entries(messageStats.byType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));
  }, [messageStats.byType]);
  
  const statusChartData = React.useMemo(() => {
    return Object.entries(messageStats.byStatus).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  }, [messageStats.byStatus]);
  
  const checkInFrequencyData = React.useMemo(() => {
    return Object.entries(messageStats.checkInStats.byFrequency).map(([frequency, count]) => {
      const frequencyName = formatFrequency(frequency as FrequencyInterval);
      return {
        name: frequencyName,
        count
      };
    });
  }, [messageStats.checkInStats.byFrequency]);
  
  function formatFrequency(frequency: FrequencyInterval | string): string {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return String(frequency);
    }
  }

  // Colors for charts
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Message Analytics</h2>
          <p className="text-gray-500">View statistics about your future messages</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCheckScheduled}
            disabled={isChecking}
          >
            <Check className="h-4 w-4 mr-2" />
            Check Scheduled
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendStatusChecks}
            disabled={sendingStatusChecks}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Send Status Checks
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Messages</CardTitle>
                <CardDescription>All messages in your tank</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{messageStats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Check-ins</CardTitle>
                <CardDescription>Currently active check-in messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold mr-3">{messageStats.checkInStats.active}</div>
                  <Bell className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Response Rate</CardTitle>
                <CardDescription>Check-in response rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {messageStats.checkInStats.total > 0 
                    ? Math.round((messageStats.checkInStats.responded / messageStats.checkInStats.total) * 100) 
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages by Type</CardTitle>
                <CardDescription>Distribution of messages by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={typeChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Messages by Status</CardTitle>
                <CardDescription>Distribution of messages by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {messageStats.checkInStats.total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Check-in Frequency</CardTitle>
                <CardDescription>Distribution of check-ins by frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={checkInFrequencyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
