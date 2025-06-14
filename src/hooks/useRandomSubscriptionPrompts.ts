
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionStatus } from './useSubscriptionStatus';

interface RandomPromptState {
  showPrompt: boolean;
  promptCount: number;
  lastDismissed: Date | null;
  urgencyLevel: 'normal' | 'high' | 'critical';
}

export function useRandomSubscriptionPrompts() {
  const { subscriptionStatus } = useSubscriptionStatus();
  const [promptState, setPromptState] = useState<RandomPromptState>({
    showPrompt: false,
    promptCount: 0,
    lastDismissed: null,
    urgencyLevel: 'normal'
  });

  // Don't show prompts if user is already subscribed
  const shouldShowPrompts = !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial;

  const dismissPrompt = useCallback(() => {
    setPromptState(prev => ({
      ...prev,
      showPrompt: false,
      lastDismissed: new Date(),
      promptCount: prev.promptCount + 1
    }));
  }, []);

  const triggerPrompt = useCallback(() => {
    if (!shouldShowPrompts) return;
    
    // Don't show if just dismissed (wait at least 3 minutes)
    if (promptState.lastDismissed) {
      const timeSinceDismissed = Date.now() - promptState.lastDismissed.getTime();
      if (timeSinceDismissed < 3 * 60 * 1000) return;
    }

    // Determine urgency level based on prompt count and time
    let urgencyLevel: 'normal' | 'high' | 'critical' = 'normal';
    if (promptState.promptCount >= 3) urgencyLevel = 'high';
    if (promptState.promptCount >= 5) urgencyLevel = 'critical';

    setPromptState(prev => ({
      ...prev,
      showPrompt: true,
      urgencyLevel
    }));
  }, [shouldShowPrompts, promptState.lastDismissed, promptState.promptCount]);

  useEffect(() => {
    if (!shouldShowPrompts) return;

    // Calculate random interval based on urgency (5-15 minutes for normal, more frequent for urgent)
    const getRandomInterval = () => {
      const baseInterval = 5 * 60 * 1000; // 5 minutes
      const maxInterval = 15 * 60 * 1000; // 15 minutes
      
      if (promptState.urgencyLevel === 'critical') {
        return baseInterval + Math.random() * (7 * 60 * 1000); // 5-12 minutes
      } else if (promptState.urgencyLevel === 'high') {
        return baseInterval + Math.random() * (10 * 60 * 1000); // 5-15 minutes
      }
      
      return baseInterval + Math.random() * (maxInterval - baseInterval); // 5-15 minutes
    };

    const interval = setInterval(() => {
      triggerPrompt();
    }, getRandomInterval());

    return () => clearInterval(interval);
  }, [shouldShowPrompts, triggerPrompt, promptState.urgencyLevel]);

  return {
    showPrompt: promptState.showPrompt,
    urgencyLevel: promptState.urgencyLevel,
    promptCount: promptState.promptCount,
    dismissPrompt,
    triggerPrompt: () => shouldShowPrompts && triggerPrompt()
  };
}
