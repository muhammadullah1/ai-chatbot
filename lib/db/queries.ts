import 'server-only'

import { genSaltSync, hashSync } from 'bcrypt-ts'
import { and, asc, desc, eq, gt, gte } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { user, chat, type User, type Message, message } from './schema'
import type { BlockKind } from '@/components/block'

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!)
const db = drizzle(client)

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email))
  } catch (error) {
    console.error('Failed to get user from database')
    throw error
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10)
  const hash = hashSync(password, salt)

  try {
    return await db.insert(user).values({ email, password: hash })
  } catch (error) {
    console.error('Failed to create user in database')
    throw error
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string
  userId: string
  title: string
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility: 'public',
    })
  } catch (error) {
    console.error('Failed to save chat in database')
    throw error
  }
}

export async function saveMessage({
  chatId,
  role,
  content,
  messageId,
  order,
}: {
  chatId: string
  role: string
  content: object
  messageId: string
  order: number
}) {
  try {
    return await db.insert(message).values({
      id: messageId,
      createdAt: new Date(),
      chatId,
      role,
      content,
      order,
    })
  } catch (error) {
    console.error('Failed to save chat in database')
    throw error
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt))
  } catch (error) {
    console.error('Failed to get chats by user from database')
    throw error
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id))
    return selectedChat
  } catch (error) {
    console.error('Failed to get chat by id from database')
    throw error
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages)
  } catch (error) {
    console.error('Failed to save messages in database', error)
    throw error
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.order));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error)
    throw error
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id))
  } catch (error) {
    console.error('Failed to get message by id from database')
    throw error
  }
}

export async function updateMessage({
  id,
  newData,
}: {
  id: string
  newData: object
}) {
  try {
    const updatedMessage = await db
      .update(message)
      .set(newData)
      .where(eq(message.id, id))

    return updatedMessage
  } catch (error) {
    console.error('Failed to update message in database:', error)
    throw error
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string
  timestamp: Date
}) {
  try {
    return await db
      .delete(message)
      .where(and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)))
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database'
    )
    throw error
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string
  visibility: 'private' | 'public'
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId))
  } catch (error) {
    console.error('Failed to update chat visibility in database')
    throw error
  }
}
