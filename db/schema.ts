import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const importedData = pgTable("imported_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fileName: text("file_name").notNull(),
  sheetName: text("sheet_name").notNull(),
  data: jsonb("data").notNull(),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertImportedDataSchema = createInsertSchema(importedData);
export const selectImportedDataSchema = createSelectSchema(importedData);
export type InsertImportedData = z.infer<typeof insertImportedDataSchema>;
export type ImportedData = z.infer<typeof selectImportedDataSchema>;
