
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TestResult {
  phase: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class DeathVerificationTester {
  private results: TestResult[] = [];

  // Phase 1: Environment Setup Verification
  async testEnvironmentSetup(): Promise<TestResult[]> {
    const phaseResults: TestResult[] = [];

    // Test 1: Check if user is authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        phaseResults.push({
          phase: 'Environment Setup',
          test: 'User Authentication',
          status: 'pass',
          message: 'User is authenticated'
        });
      } else {
        phaseResults.push({
          phase: 'Environment Setup',
          test: 'User Authentication',
          status: 'fail',
          message: 'User not authenticated - login required for testing'
        });
        return phaseResults;
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Environment Setup',
        test: 'User Authentication',
        status: 'fail',
        message: 'Authentication check failed',
        details: error
      });
      return phaseResults;
    }

    // Test 2: Check database tables exist
    const requiredTables = [
      'death_verification_settings',
      'death_verification_checkins',
      'death_verification_requests',
      'death_verification_pins',
      'death_verification_logs',
      'will_beneficiaries',
      'will_executors'
    ];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === '42P01') {
          phaseResults.push({
            phase: 'Environment Setup',
            test: `Table: ${table}`,
            status: 'fail',
            message: `Table ${table} does not exist`
          });
        } else {
          phaseResults.push({
            phase: 'Environment Setup',
            test: `Table: ${table}`,
            status: 'pass',
            message: `Table ${table} exists`
          });
        }
      } catch (error) {
        phaseResults.push({
          phase: 'Environment Setup',
          test: `Table: ${table}`,
          status: 'fail',
          message: `Error checking table ${table}`,
          details: error
        });
      }
    }

    // Test 3: Check grace_period column exists
    try {
      const { data, error } = await supabase
        .from('death_verification_settings')
        .select('grace_period')
        .limit(1);
      
      if (error) {
        phaseResults.push({
          phase: 'Environment Setup',
          test: 'Grace Period Column',
          status: 'fail',
          message: 'grace_period column missing - run migration',
          details: error
        });
      } else {
        phaseResults.push({
          phase: 'Environment Setup',
          test: 'Grace Period Column',
          status: 'pass',
          message: 'grace_period column exists'
        });
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Environment Setup',
        test: 'Grace Period Column',
        status: 'fail',
        message: 'Error checking grace_period column',
        details: error
      });
    }

    this.results.push(...phaseResults);
    return phaseResults;
  }

  // Phase 2: Basic Function Testing
  async testBasicFunctionality(): Promise<TestResult[]> {
    const phaseResults: TestResult[] = [];

    // Test 1: Test death-verification function connectivity
    try {
      const { data, error } = await supabase.functions.invoke('death-verification', {
        body: { action: 'process_checkins' }
      });

      if (error) {
        phaseResults.push({
          phase: 'Basic Function',
          test: 'Death Verification Function',
          status: 'fail',
          message: 'Function call failed',
          details: error
        });
      } else {
        phaseResults.push({
          phase: 'Basic Function',
          test: 'Death Verification Function',
          status: 'pass',
          message: 'Function called successfully',
          details: data
        });
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Basic Function',
        test: 'Death Verification Function',
        status: 'fail',
        message: 'Function call error',
        details: error
      });
    }

    // Test 2: Check death verification settings
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: settings, error } = await supabase
          .from('death_verification_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          phaseResults.push({
            phase: 'Basic Function',
            test: 'Death Verification Settings',
            status: 'warning',
            message: 'No death verification settings found - create them first'
          });
        } else if (error) {
          phaseResults.push({
            phase: 'Basic Function',
            test: 'Death Verification Settings',
            status: 'fail',
            message: 'Error fetching settings',
            details: error
          });
        } else {
          phaseResults.push({
            phase: 'Basic Function',
            test: 'Death Verification Settings',
            status: 'pass',
            message: `Settings found - Check-ins ${settings.check_in_enabled ? 'enabled' : 'disabled'}`,
            details: settings
          });
        }
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Basic Function',
        test: 'Death Verification Settings',
        status: 'fail',
        message: 'Error checking settings',
        details: error
      });
    }

    this.results.push(...phaseResults);
    return phaseResults;
  }

  // Phase 3: Email Flow Testing
  async testEmailFlows(): Promise<TestResult[]> {
    const phaseResults: TestResult[] = [];

    // Test 1: Check if beneficiaries exist
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: beneficiaries, error } = await supabase
          .from('will_beneficiaries')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Beneficiaries Check',
            status: 'fail',
            message: 'Error checking beneficiaries',
            details: error
          });
        } else if (!beneficiaries || beneficiaries.length === 0) {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Beneficiaries Check',
            status: 'warning',
            message: 'No beneficiaries found - add some for email testing'
          });
        } else {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Beneficiaries Check',
            status: 'pass',
            message: `Found ${beneficiaries.length} beneficiaries`,
            details: beneficiaries
          });
        }
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Email Flow',
        test: 'Beneficiaries Check',
        status: 'fail',
        message: 'Error checking beneficiaries',
        details: error
      });
    }

    // Test 2: Check if executors exist
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: executors, error } = await supabase
          .from('will_executors')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Executors Check',
            status: 'fail',
            message: 'Error checking executors',
            details: error
          });
        } else if (!executors || executors.length === 0) {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Executors Check',
            status: 'warning',
            message: 'No executors found - add some for email testing'
          });
        } else {
          phaseResults.push({
            phase: 'Email Flow',
            test: 'Executors Check',
            status: 'pass',
            message: `Found ${executors.length} executors`,
            details: executors
          });
        }
      }
    } catch (error) {
      phaseResults.push({
        phase: 'Email Flow',
        test: 'Executors Check',
        status: 'fail',
        message: 'Error checking executors',
        details: error
      });
    }

    this.results.push(...phaseResults);
    return phaseResults;
  }

  // Phase 4: Simulation Testing - Fixed implementation
  async simulateMissedCheckin(): Promise<TestResult[]> {
    const phaseResults: TestResult[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        phaseResults.push({
          phase: 'Simulation',
          test: 'Simulate Missed Check-in',
          status: 'fail',
          message: 'User not authenticated'
        });
        return phaseResults;
      }

      // Check if user has check-ins enabled
      const { data: settings } = await supabase
        .from('death_verification_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!settings || !settings.check_in_enabled) {
        // Create default settings if none exist
        const { error: insertError } = await supabase
          .from('death_verification_settings')
          .insert({
            user_id: session.user.id,
            check_in_enabled: true,
            check_in_frequency: 30,
            grace_period: 7,
            beneficiary_verification_interval: 48,
            reminder_frequency: 24,
            pin_system_enabled: true,
            executor_override_enabled: true,
            trusted_contact_enabled: true,
            failsafe_enabled: true,
            notification_preferences: {
              email: true,
              push: true
            }
          });

        if (insertError) {
          phaseResults.push({
            phase: 'Simulation',
            test: 'Simulate Missed Check-in',
            status: 'fail',
            message: 'Failed to create default settings',
            details: insertError
          });
          return phaseResults;
        }
      }

      // Create or update a check-in record to simulate missed check-in
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (settings?.grace_period || 7) - 1);

      // Try to get the latest check-in first
      const { data: existingCheckin } = await supabase
        .from('death_verification_checkins')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingCheckin) {
        // Update existing check-in to be overdue
        const { error: updateError } = await supabase
          .from('death_verification_checkins')
          .update({ 
            next_check_in: pastDate.toISOString(),
            status: 'alive'
          })
          .eq('id', existingCheckin.id);

        if (updateError) {
          phaseResults.push({
            phase: 'Simulation',
            test: 'Simulate Missed Check-in',
            status: 'fail',
            message: 'Failed to update existing check-in',
            details: updateError
          });
        } else {
          phaseResults.push({
            phase: 'Simulation',
            test: 'Simulate Missed Check-in',
            status: 'pass',
            message: `Successfully simulated missed check-in (overdue by ${Math.abs(pastDate.getDate() - new Date().getDate())} days)`,
            details: { next_check_in: pastDate.toISOString() }
          });
        }
      } else {
        // Create a new overdue check-in
        const { error: insertError } = await supabase
          .from('death_verification_checkins')
          .insert({
            user_id: session.user.id,
            status: 'alive',
            checked_in_at: pastDate.toISOString(),
            next_check_in: pastDate.toISOString()
          });

        if (insertError) {
          phaseResults.push({
            phase: 'Simulation',
            test: 'Simulate Missed Check-in',
            status: 'fail',
            message: 'Failed to create overdue check-in',
            details: insertError
          });
        } else {
          phaseResults.push({
            phase: 'Simulation',
            test: 'Simulate Missed Check-in',
            status: 'pass',
            message: `Successfully created overdue check-in simulation (overdue by ${Math.abs(pastDate.getDate() - new Date().getDate())} days)`,
            details: { next_check_in: pastDate.toISOString() }
          });
        }
      }

    } catch (error) {
      phaseResults.push({
        phase: 'Simulation',
        test: 'Simulate Missed Check-in',
        status: 'fail',
        message: 'Error during simulation',
        details: error
      });
    }

    this.results.push(...phaseResults);
    return phaseResults;
  }

  // Test manual trigger
  async testManualTrigger(): Promise<TestResult[]> {
    const phaseResults: TestResult[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        phaseResults.push({
          phase: 'Manual Trigger',
          test: 'Trigger Death Verification',
          status: 'fail',
          message: 'User not authenticated'
        });
        return phaseResults;
      }

      // Call the trigger-death-verification function directly
      const { data, error } = await supabase.functions.invoke('trigger-death-verification', {
        body: { 
          userId: session.user.id
        }
      });

      if (error) {
        phaseResults.push({
          phase: 'Manual Trigger',
          test: 'Trigger Death Verification',
          status: 'fail',
          message: 'Manual trigger failed',
          details: error
        });
      } else {
        phaseResults.push({
          phase: 'Manual Trigger',
          test: 'Trigger Death Verification',
          status: 'pass',
          message: 'Manual trigger successful - Check your email for notifications',
          details: data
        });
      }

    } catch (error) {
      phaseResults.push({
        phase: 'Manual Trigger',
        test: 'Trigger Death Verification',
        status: 'fail',
        message: 'Error during manual trigger',
        details: error
      });
    }

    this.results.push(...phaseResults);
    return phaseResults;
  }

  // Get all results
  getAllResults(): TestResult[] {
    return this.results;
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }

  // Get summary
  getSummary(): { total: number; passed: number; failed: number; warnings: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    return { total, passed, failed, warnings };
  }
}
