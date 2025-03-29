
// Prevent paste events on security-sensitive fields
export const preventPaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  return false;
};

// Check if honeypot fields are filled (bot detection)
export const checkHoneypot = (formData: FormData): boolean => {
  const honeypotField = formData.get('user_email_confirmation');
  return !honeypotField || honeypotField === '';
};
