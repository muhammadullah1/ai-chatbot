import { saveMessageTest } from '@/lib/db/queries'
import { z } from 'zod'

const contentItemSchema = z.object({
  type: z.string().min(1, { message: 'type is required' }),
  text: z.string().min(1, { message: 'text is required' }),
})

const messageSchema = z.object({
  chatId: z.string().uuid({ message: 'chatId must be a valid UUID' }),
  role: z.string().min(1, { message: 'role is required' }),
  content: z.array(contentItemSchema).refine((val) => val.length > 0, {
    message: 'content must be a non-empty array of objects',
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chatId, role, content } = messageSchema.parse(body)
    await saveMessageTest({ chatId, role, content })
    return new Response(
      JSON.stringify({ success: true, message: 'Chat sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Validation error',
          issues: error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
