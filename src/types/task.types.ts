import type { Database } from './database.types';
import type { DerivedTaskStatus } from '../lib/taskLogic';

type TaskTable = Database['public']['Tables']['tasks'];
type TaskBatchTable = Database['public']['Tables']['task_batches'];

export type Task = TaskTable['Row'];
export type TaskInsert = TaskTable['Insert'];
export type TaskUpdate = TaskTable['Update'];

export type TaskBatch = TaskBatchTable['Row'];

export type { DerivedTaskStatus };

/**
 * A task enriched with its computed derived status.
 */
export interface TaskWithDerived extends Task {
  derivedStatus: DerivedTaskStatus;
}
