import { supabase } from '@/lib/supabase';

export async function uploadPortfolioImage(userId: string, uri: string) {
  const extension = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const path = `${userId}/${Date.now()}.${extension}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from('portfolio').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
  return data.publicUrl;
}
