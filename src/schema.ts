import { pgTable, varchar, date, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable('students', {
  id: varchar('id', { length: 20 }).primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  birthDate: date('birth_date', { mode: 'string' }).notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;