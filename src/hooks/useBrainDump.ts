import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { BrainDumpEntry } from '../types';

export function useCaptureMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('capture_thought', {
        p_user_id: user.id,
        p_content: content,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unsorted-thoughts'] });
      queryClient.invalidateQueries({ queryKey: ['brain-dump'] });
    },
  });
}

export function useBrainDumpHistory() {
  const user = useAuthStore((s) => s.user);

  return useQuery<BrainDumpEntry[]>({
    queryKey: ['brain-dump', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('brain_dump_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
