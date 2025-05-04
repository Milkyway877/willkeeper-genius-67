import { createSystemNotification, createCheckInNotification } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

export const createTestNotification = async () => {
  try {
    console.log('Creating test notification...');
    const result = await createSystemNotification('info', {
      title: 'Test Notification',
      description: 'This is a test notification to verify the system is working.'
    });
    
    if (result) {
      console.log('Test notification created successfully:', result);
      return true;
    } else {
      console.error('Failed to create test notification');
      return false;
    }
  } catch (error) {
    console.error('Error creating test notification:', error);
    return false;
  }
};

export const createSecurityNotification = async () => {
  return createSystemNotification('security', {
    title: 'Security Alert',
    description: 'This is a test security notification to verify the system is working.'
  });
};

export const createSuccessNotification = async () => {
  return createSystemNotification('success', {
    title: 'Success',
    description: 'This is a test success notification to verify the system is working.'
  });
};

export const createWarningNotification = async () => {
  return createSystemNotification('warning', {
    title: 'Warning',
    description: 'This is a test warning notification to verify the system is working.'
  });
};

export const createWillCreatedNotification = async () => {
  return createSystemNotification('will_created', {
    title: 'Will Created',
    description: 'This is a test will creation notification to verify the system is working.'
  });
};

export const createWillUpdatedNotification = async () => {
  return createSystemNotification('will_updated', {
    title: 'Will Updated',
    description: 'This is a test will update notification to verify the system is working.'
  });
};

export const createBeneficiaryAddedNotification = async () => {
  return createSystemNotification('beneficiary_added', {
    title: 'Beneficiary Added',
    description: 'This is a test beneficiary added notification to verify the system is working.'
  });
};

export const createExecutorAddedNotification = async () => {
  return createSystemNotification('executor_added', {
    title: 'Executor Added',
    description: 'This is a test executor added notification to verify the system is working.'
  });
};

export const createDocumentUploadedNotification = async () => {
  return createSystemNotification('document_uploaded', {
    title: 'Document Uploaded',
    description: 'This is a test document uploaded notification to verify the system is working.'
  });
};

export const createCheckInCompletedNotification = async () => {
  return createCheckInNotification('completed', { date: new Date().toLocaleDateString() });
};

export const createCheckInMissedNotification = async () => {
  return createCheckInNotification('missed', { date: new Date().toLocaleDateString() });
};

export const createCheckInScheduledNotification = async () => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 7);
  return createCheckInNotification('scheduled', { nextDate: nextDate.toLocaleDateString() });
};

export const testAllNotificationChannels = async () => {
  console.log('Testing all notification channels...');
  
  const testChecks = [];
  let notificationWorks = false;
  
  try {
    // 1. Try direct toast (should always work)
    toast({
      title: "Toast Test Successful",
      description: "Toast notification system is working correctly",
      variant: "default",
    });
    testChecks.push('Toast: SUCCESS');
    
    // 2. Try RPC function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Testing RPC notification method...');
        const { data: notificationId, error: rpcError } = await supabase.rpc(
          'create_notification',
          {
            p_user_id: session.user.id,
            p_title: 'RPC Test',
            p_description: 'Testing the RPC notification method',
            p_type: 'info'
          }
        );
        
        if (rpcError) {
          console.error('RPC notification failed:', rpcError);
          testChecks.push('RPC: FAILED');
        } else {
          console.log('RPC notification succeeded:', notificationId);
          testChecks.push('RPC: SUCCESS');
          notificationWorks = true;
        }
      }
    } catch (rpcError) {
      console.error('Error testing RPC notification:', rpcError);
      testChecks.push('RPC: ERROR');
    }
    
    // 3. Try Edge Function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Testing edge function notification method...');
        const response = await fetch(`${window.location.origin}/functions/v1/create-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify({
            title: 'Edge Function Test',
            description: 'Testing the edge function notification method',
            type: 'info'
          })
        });
        
        if (!response.ok) {
          console.error('Edge function notification failed:', response.status);
          testChecks.push('Edge Function: FAILED');
        } else {
          const data = await response.json();
          console.log('Edge function notification succeeded:', data);
          testChecks.push('Edge Function: SUCCESS');
          notificationWorks = true;
        }
      }
    } catch (edgeError) {
      console.error('Error testing edge function notification:', edgeError);
      testChecks.push('Edge Function: ERROR');
    }
    
    // 4. Try Direct Insert
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Testing direct insert notification method...');
        const { data: insertData, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: session.user.id,
            title: 'Direct Insert Test',
            description: 'Testing the direct insert notification method',
            type: 'info',
            read: false
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Direct insert notification failed:', insertError);
          testChecks.push('Direct Insert: FAILED');
        } else {
          console.log('Direct insert notification succeeded:', insertData);
          testChecks.push('Direct Insert: SUCCESS');
          notificationWorks = true;
        }
      }
    } catch (insertError) {
      console.error('Error testing direct insert notification:', insertError);
      testChecks.push('Direct Insert: ERROR');
    }
    
    // 5. Try createSystemNotification helper
    try {
      console.log('Testing createSystemNotification helper...');
      const notification = await createSystemNotification('info', {
        title: 'Helper Test',
        description: 'Testing the createSystemNotification helper function'
      });
      
      if (notification) {
        console.log('createSystemNotification helper succeeded:', notification);
        testChecks.push('Helper Function: SUCCESS');
        notificationWorks = true;
      } else {
        console.warn('createSystemNotification helper returned null');
        testChecks.push('Helper Function: FAILED');
      }
    } catch (helperError) {
      console.error('Error testing createSystemNotification helper:', helperError);
      testChecks.push('Helper Function: ERROR');
    }
    
    // 6. Check if Realtime is working
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const channel = supabase
          .channel('notification-test')
          .on('presence', { event: 'sync' }, () => {
            console.log('Realtime presence sync successful');
            testChecks.push('Realtime Presence: SUCCESS');
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Realtime subscription successful');
              testChecks.push('Realtime Subscription: SUCCESS');
            } else {
              console.warn('Realtime subscription status:', status);
              testChecks.push(`Realtime Subscription: ${status}`);
            }
          });
          
        // Clean up after 2 seconds
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 2000);
      } catch (realtimeError) {
        console.error('Error testing Realtime:', realtimeError);
        testChecks.push('Realtime: ERROR');
      }
    }
    
    // Show final test results
    console.log('Notification system test results:', testChecks);
    toast({
      title: notificationWorks ? "Notification Tests Completed" : "Notification Tests Failed",
      description: testChecks.join(', '),
      variant: notificationWorks ? "default" : "destructive",
    });
    
    return { success: notificationWorks, results: testChecks };
  } catch (error) {
    console.error('Error during notification system tests:', error);
    toast({
      title: "Notification Tests Error",
      description: "An error occurred while testing notifications",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

// Function to create multiple notifications at once for testing the counter
export const createMultipleNotifications = async (count: number) => {
  const notificationTypes = [
    { type: 'info', title: 'Test Info' },
    { type: 'success', title: 'Test Success' },
    { type: 'warning', title: 'Test Warning' },
    { type: 'security', title: 'Test Security' },
    { type: 'will_created', title: 'Test Will Created' },
    { type: 'beneficiary_added', title: 'Test Beneficiary Added' }
  ] as const;

  const promises = [];
  
  // Create specified number of notifications with sequential numbering
  for (let i = 1; i <= count; i++) {
    const typeIndex = (i - 1) % notificationTypes.length;
    const { type, title } = notificationTypes[typeIndex];
    
    promises.push(
      createSystemNotification(type, {
        title: `${title} #${i}`,
        description: `This is test notification #${i} of ${count} created to test the counter.`
      })
    );
    
    // Small delay between notifications to avoid rate limiting
    if (i < count) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  await Promise.all(promises);
  return true;
};

// Add ability to access this from console or UI
(window as any).testNotifications = {
  createTestNotification,
  createSecurityNotification,
  createSuccessNotification,
  createWarningNotification,
  createWillCreatedNotification,
  createCheckInCompletedNotification,
  testAllNotificationChannels,
  createMultipleNotifications
};
