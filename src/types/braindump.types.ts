import type { Database } from './database.types';

type BrainDumpEntryTable = Database['public']['Tables']['brain_dump_entries'];
type UnsortedThoughtTable = Database['public']['Tables']['unsorted_thoughts'];

export type BrainDumpEntry = BrainDumpEntryTable['Row'];
export type BrainDumpEntryInsert = BrainDumpEntryTable['Insert'];

export type UnsortedThought = UnsortedThoughtTable['Row'];
export type UnsortedThoughtInsert = UnsortedThoughtTable['Insert'];
export type UnsortedThoughtUpdate = UnsortedThoughtTable['Update'];

/**
 * The set of item types an unsorted thought can be converted into.
 */
export type ConversionType = 'task' | 'event' | 'note' | 'idea';
