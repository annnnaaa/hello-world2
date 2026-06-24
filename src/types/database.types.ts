export type ThoughtStatus = 'unsorted' | 'converted' | 'dismissed';
export type TaskEnergy = 'low' | 'medium' | 'high';
export type TaskStatusOverride = 'active' | 'hold' | 'done';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          theme: 'dark' | 'light' | 'system';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          theme?: 'dark' | 'light' | 'system';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          theme?: 'dark' | 'light' | 'system';
          created_at?: string;
          updated_at?: string;
        };
      };
      brain_dump_entries: {
        Row: {
          id: string;
          user_id: string;
          raw_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          raw_text?: string;
          created_at?: string;
        };
      };
      unsorted_thoughts: {
        Row: {
          id: string;
          user_id: string;
          brain_dump_id: string | null;
          content: string;
          status: ThoughtStatus;
          converted_to_type: string | null;
          converted_to_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brain_dump_id?: string | null;
          content: string;
          status?: ThoughtStatus;
          converted_to_type?: string | null;
          converted_to_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brain_dump_id?: string | null;
          content?: string;
          status?: ThoughtStatus;
          converted_to_type?: string | null;
          converted_to_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_batches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          batch_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          energy: TaskEnergy;
          status: TaskStatusOverride;
          is_done: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          batch_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          energy?: TaskEnergy;
          status?: TaskStatusOverride;
          is_done?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          batch_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          energy?: TaskEnergy;
          status?: TaskStatusOverride;
          is_done?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          all_day: boolean;
          color: string | null;
          recurrence_rule: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          all_day?: boolean;
          color?: string | null;
          recurrence_rule?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          all_day?: boolean;
          color?: string | null;
          recurrence_rule?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      birthdays: {
        Row: {
          id: string;
          user_id: string;
          person_name: string;
          birth_date: string;
          notes: string | null;
          remind_days_before: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_name: string;
          birth_date: string;
          notes?: string | null;
          remind_days_before?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_name?: string;
          birth_date?: string;
          notes?: string | null;
          remind_days_before?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          folder_id: string | null;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          folder_id?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          folder_id?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          category: string | null;
          starred: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          category?: string | null;
          starred?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          category?: string | null;
          starred?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_id: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_id?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          parent_id?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          file_name: string;
          file_path: string;
          mime_type: string;
          file_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          file_name: string;
          file_path: string;
          mime_type: string;
          file_size: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          file_name?: string;
          file_path?: string;
          mime_type?: string;
          file_size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
        };
      };
      document_tags: {
        Row: {
          document_id: string;
          tag_id: string;
        };
        Insert: {
          document_id: string;
          tag_id: string;
        };
        Update: {
          document_id?: string;
          tag_id?: string;
        };
      };
      thought_tags: {
        Row: {
          thought_id: string;
          tag_id: string;
        };
        Insert: {
          thought_id: string;
          tag_id: string;
        };
        Update: {
          thought_id?: string;
          tag_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      thought_status: ThoughtStatus;
      task_energy: TaskEnergy;
      task_status_override: TaskStatusOverride;
    };
  };
}
