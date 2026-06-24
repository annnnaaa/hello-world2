import type { Database } from './database.types';

type FolderTable = Database['public']['Tables']['folders'];
type DocumentTable = Database['public']['Tables']['documents'];
type TagTable = Database['public']['Tables']['tags'];

export type Folder = FolderTable['Row'];
export type FolderInsert = FolderTable['Insert'];
export type FolderUpdate = FolderTable['Update'];

/**
 * Recursive folder tree node.
 */
export interface FolderNode extends Folder {
  children: FolderNode[];
}

export type Document = DocumentTable['Row'];
export type DocumentInsert = DocumentTable['Insert'];
export type DocumentUpdate = DocumentTable['Update'];

export type Tag = TagTable['Row'];
export type TagInsert = TagTable['Insert'];

/**
 * Upload progress state for file uploads.
 */
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}
