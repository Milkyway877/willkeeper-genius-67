
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
};

export const isInLovablePreview = (): boolean => {
  return isInIframe() && window.location.hostname.includes('lovableproject.com');
};
