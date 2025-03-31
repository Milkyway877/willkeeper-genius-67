
// Add the missing functions or create aliases for existing ones
export const getLegacyVaultItems = getVaultItems;
export const createLegacyVaultItem = createVaultItem;
export const updateLegacyVaultItem = updateVaultItem;
export const deleteLegacyVaultItem = deleteVaultItem;

// Add missing toggle function
export async function toggleItemEncryption(itemId: string, isEncrypted: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('legacy_vault')
      .update({ is_encrypted: isEncrypted })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling item encryption:', error);
    return false;
  }
}
