
import { supabase } from '@/integrations/supabase/client';

export type WillContact = {
  id?: string;
  will_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
};

export const saveWillContacts = async (willId: string, contacts: Omit<WillContact, 'will_id'>[]) => {
  try {
    const contactsToSave = contacts.map(contact => ({
      ...contact,
      will_id: willId
    }));
    
    const { data, error } = await supabase
      .from('will_contacts')
      .upsert(contactsToSave)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving contacts:', error);
    throw error;
  }
};

export const getWillContacts = async (willId: string) => {
  try {
    const { data, error } = await supabase
      .from('will_contacts')
      .select('*')
      .eq('will_id', willId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
};
