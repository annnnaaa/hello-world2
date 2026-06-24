import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { UnsortedThought, ConversionType } from '../types';

export function useUnsortedThoughts() {
  const user = useAuthStore((s) => s.user);

  return useQuery<UnsortedThought[]>({
    queryKey: ['unsorted-thoughts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('unsorted_thoughts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'unsorted')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useConvertThought() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      thoughtId,
      type,
      data,
    }: {
      thoughtId: string;
      type: ConversionType;
      data: Record<string, unknown>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const tableMap: Record<ConversionType, string> = {
        task: 'tasks',
        event: 'calendar_events',
        note: 'notes',
        idea: 'ideas',
      };

      const tableName = tableMap[type];

      // 1. Insert into target table
      const { data: newRecord, error: insertError } = await supabase
        .from(tableName as any)
        .insert({ ...data, user_id: user.id } as any)
        .select()
        .single();
      if (insertError) throw insertError;

      // 2. Update unsorted thought
      const { error: updateError } = await supabase
        .from('unsorted_thoughts')
        .update({
          status: 'converted' as const,
          converted_to: type,
          converted_id: (newRecord as any).id,
        })
        .eq('id', thoughtId);
      if (updateError) throw updateError;

      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unsorted-thoughts'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useDismissThought() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thoughtId: string) => {
      const { error } = await supabase
        .from('unsorted_thoughts')
        .update({ status: 'dismissed' as const })
        .eq('id', thoughtId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unsorted-thoughts'] });
    },
  });
}
