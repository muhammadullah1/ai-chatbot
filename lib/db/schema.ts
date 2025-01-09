import type { InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  integer,
} from 'drizzle-orm/pg-core'

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
})

export type User = InferSelectModel<typeof user>

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title'),
  userId: uuid('userId').notNull().references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] }) .notNull().default('public'),
})

export type Chat = InferSelectModel<typeof chat>

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').notNull().references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('createdAt').notNull(),
})

export type Message = InferSelectModel<typeof message>
