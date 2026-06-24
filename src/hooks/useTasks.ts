import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { deriveTaskStatus, STATUS_ORDER } from '../lib/taskLogic';
import type { Task, TaskInsert, TaskUpdate, TaskWithDerived, DerivedTaskStatus } from '../types';

interface TaskFilters {
  status?: DerivedTaskStatus;
  energy?: string;
  batchId?: string;
}

export function useTasks(filters?: TaskFilters) {
  const user = useAuthStore((s) => s.user);

  return useQuery<TaskWithDerived[]>({
    queryKey: ['tasks', user?.id, filters],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('tasks')
        .select('*, batch:task_batches(*)')
        .eq('user_id', user.id)
        .eq('is_done', false);

      if (filters?.energy) {
        query = query.eq('energy', filters.energy);
      }
      if (filters?.batchId) {
        query = query.eq('batch_id', filters.batchId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const tasksWithDerived: TaskWithDerived[] = (data ?? []).map((task: any) => ({
        ...task,
        derivedStatus: deriveTaskStatus(task as Task),
      }));

      // Filter by derived status client-side
      const filtered = filters?.status
        ? tasksWithDerived.filter((t) => t.derivedStatus === filters.status)
        : tasksWithDerived;

      // Sort by status order
      return filtered.sort(
        (a, b) => STATUS_ORDER[a.derivedStatus] - STATUS_ORDER[b.derivedStatus],
      );
    },
    enabled: !!user,
  });
}

export function useTask(id: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery<Task>({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, batch:task_batches(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (task: Omit<TaskInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useToggleTaskDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          is_done: isDone,
          done_at: isDone ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
