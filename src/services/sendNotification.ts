
import { createNotification, NotificationType } from "./simpleNotificationService";

// Flexible helper to trigger notifications anywhere!
export const sendNotification = async (
  title: string,
  description: string,
  type: NotificationType = 'info'
) => {
  return await createNotification({ title, description, type });
};
