import type { Database } from './database.types';

type CalendarEventTable = Database['public']['Tables']['calendar_events'];
type BirthdayTable = Database['public']['Tables']['birthdays'];

export type CalendarEvent = CalendarEventTable['Row'];
export type CalendarEventInsert = CalendarEventTable['Insert'];
export type CalendarEventUpdate = CalendarEventTable['Update'];

export type Birthday = BirthdayTable['Row'];
export type BirthdayInsert = BirthdayTable['Insert'];
export type BirthdayUpdate = BirthdayTable['Update'];

/**
 * Discriminated union representing any item that can appear on a calendar.
 */
export type CalendarItem =
  | { kind: 'event'; data: CalendarEvent }
  | { kind: 'task'; data: { id: string; title: string; due_date: string; is_done: boolean } }
  | { kind: 'birthday'; data: Birthday };
