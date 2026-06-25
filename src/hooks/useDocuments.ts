import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useDocuments(folderId?: string | null, searchQuery?: string) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['documents', user?.id, folderId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, tags:document_tags(tag:tags(*))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      } else if (folderId === null) {
        query = query.is('folder_id', null);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async ({ file, folderId }: { file: File; folderId?: string | null }) => {
      const ext = file.name.split('.').pop();
      const storagePath = `${user!.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user!.id,
          folder_id: folderId || null,
          name: file.name,
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          storage_bucket: 'documents',
        })
        .select()
        .single();

      if (error) {
        await supabase.storage.from('documents').remove([storagePath]);
        throw error;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      await supabase.storage.from('documents').remove([filePath]);
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDocumentUrl(filePath: string | undefined) {
  return useQuery({
    queryKey: ['document-url', filePath],
    queryFn: async () => {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath!, 3600);
      return data?.signedUrl ?? null;
    },
    enabled: !!filePath,
    staleTime: 50 * 60 * 1000,
  });
}
