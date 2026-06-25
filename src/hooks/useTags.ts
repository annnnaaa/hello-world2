import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useTags() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (tag: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tag, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useToggleDocumentTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, tagId, add }: { documentId: string; tagId: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase
          .from('document_tags')
          .insert({ document_id: documentId, tag_id: tagId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('document_tags')
          .delete()
          .eq('document_id', documentId)
          .eq('tag_id', tagId);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}
