import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { TaskBatch } from '../types';

export function useTaskBatches() {
  const user = useAuthStore((s) => s.user);

  return useQuery<TaskBatch[]>({
    queryKey: ['task-batches', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('task_batches')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (batch: { name: string; color?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('task_batches')
        .insert({ ...batch, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-batches'] });
    },
  });
}
