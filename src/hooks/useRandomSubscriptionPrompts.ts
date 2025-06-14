
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { checkUserHasWill } from '@/services/willCheckService';

interface RandomPromptState {
  showPrompt: boolean;
  promptCount: number;
  lastDismissed: Date | null;
  urgencyLevel: 'normal' | 'high' | 'critical';
  timeRemaining: number; // in milliseconds
  countdownStarted: Date | null;
  hasWills: boolean;
}

export function useRandomSubscriptionPrompts() {
  const { subscriptionStatus } = useSubscriptionStatus();
  const [promptState, setPromptState] = useState<RandomPromptState>({
    showPrompt: false,
    promptCount: 0,
    lastDismissed: null,
    urgencyLevel: 'normal',
    timeRemaining: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    countdownStarted: null,
    hasWills: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Don't show prompts if user is already subscribed OR has no wills
  const shouldShowPrompts = !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial && promptState.hasWills;

  // Check if user has any wills and initialize countdown - ONLY if they have wills
  useEffect(() => {
    const checkUserWills = async () => {
      try {
        const willStatus = await checkUserHasWill();
        const hasWills = willStatus.hasWill;
        
        console.log('useRandomSubscriptionPrompts: Will status check:', { hasWills, willCount: willStatus.willCount });
        
        if (!hasWills) {
          // No wills, no prompts needed - clear any existing state
          setPromptState(prev => ({
            ...prev,
            hasWills: false,
            showPrompt: false,
            timeRemaining: 24 * 60 * 60 * 1000,
            countdownStarted: null
          }));
          return;
        }

        // User has wills, check for countdown start
        const savedCountdownStart = localStorage.getItem('willCountdownStart');
        const savedPromptCount = localStorage.getItem('promptCount');
        
        let countdownStart: Date;
        
        if (savedCountdownStart) {
          countdownStart = new Date(savedCountdownStart);
        } else {
          // Start countdown now since user has wills but no countdown was set
          countdownStart = new Date();
          localStorage.setItem('willCountdownStart', countdownStart.toISOString());
        }

        const now = new Date();
        const elapsed = now.getTime() - countdownStart.getTime();
        const remaining = Math.max(0, (24 * 60 * 60 * 1000) - elapsed);
        
        setPromptState(prev => ({
          ...prev,
          timeRemaining: remaining,
          countdownStarted: countdownStart,
          promptCount: savedPromptCount ? parseInt(savedPromptCount) : 0,
          hasWills: true
        }));
      } catch (error) {
        console.error('Error checking user wills in useRandomSubscriptionPrompts:', error);
      }
    };

    checkUserWills();
  }, []);

  // Real-time countdown updater - only if user has wills
  useEffect(() => {
    if (!shouldShowPrompts || !promptState.countdownStarted) return;

    countdownRef.current = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - promptState.countdownStarted!.getTime();
      const remaining = Math.max(0, (24 * 60 * 60 * 1000) - elapsed);
      
      let urgencyLevel: 'normal' | 'high' | 'critical' = 'normal';
      if (remaining < 60 * 60 * 1000) urgencyLevel = 'critical'; // Last hour
      else if (remaining < 4 * 60 * 60 * 1000) urgencyLevel = 'high'; // Last 4 hours
      
      setPromptState(prev => ({
        ...prev,
        timeRemaining: remaining,
        urgencyLevel
      }));
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [shouldShowPrompts, promptState.countdownStarted]);

  const dismissPrompt = useCallback(() => {
    const newCount = promptState.promptCount + 1;
    localStorage.setItem('promptCount', newCount.toString());
    
    setPromptState(prev => ({
      ...prev,
      showPrompt: false,
      lastDismissed: new Date(),
      promptCount: newCount
    }));
  }, [promptState.promptCount]);

  const triggerPrompt = useCallback(() => {
    if (!shouldShowPrompts) return;
    
    // Don't show if just dismissed (wait time based on urgency)
    if (promptState.lastDismissed) {
      const timeSinceDismissed = Date.now() - promptState.lastDismissed.getTime();
      let waitTime = 2 * 60 * 1000; // 2 minutes default
      
      if (promptState.urgencyLevel === 'critical') waitTime = 30 * 1000; // 30 seconds
      else if (promptState.urgencyLevel === 'high') waitTime = 60 * 1000; // 1 minute
      
      if (timeSinceDismissed < waitTime) return;
    }

    setPromptState(prev => ({
      ...prev,
      showPrompt: true
    }));
  }, [shouldShowPrompts, promptState.lastDismissed, promptState.urgencyLevel]);

  // Auto-trigger prompts based on urgency - only if user has wills
  useEffect(() => {
    if (!shouldShowPrompts) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let intervalTime = 2 * 60 * 1000; // 2 minutes default
    
    if (promptState.urgencyLevel === 'critical') {
      intervalTime = 30 * 1000; // Every 30 seconds in final hour
    } else if (promptState.urgencyLevel === 'high') {
      intervalTime = 60 * 1000; // Every minute in final 4 hours
    }

    intervalRef.current = setInterval(() => {
      triggerPrompt();
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shouldShowPrompts, triggerPrompt, promptState.urgencyLevel]);

  // Format time remaining for display
  const formatTimeRemaining = useCallback(() => {
    const hours = Math.floor(promptState.timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((promptState.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((promptState.timeRemaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [promptState.timeRemaining]);

  return {
    showPrompt: promptState.showPrompt && promptState.hasWills && shouldShowPrompts,
    urgencyLevel: promptState.urgencyLevel,
    promptCount: promptState.promptCount,
    timeRemaining: promptState.timeRemaining,
    formattedTimeRemaining: formatTimeRemaining(),
    hasWills: promptState.hasWills,
    dismissPrompt,
    triggerPrompt: () => shouldShowPrompts && triggerPrompt()
  };
}
