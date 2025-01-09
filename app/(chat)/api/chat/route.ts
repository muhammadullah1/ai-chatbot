import {
  saveMessage,
  getChatById,
  saveChat,
  getMessageById,
  updateMessage,
} from '@/lib/db/queries';
import { z } from 'zod';
import { formatMarkdown } from '@/lib/markdown';

const contentItemSchema = z.object({
  messageId: z.string().uuid({ message: 'messageId must be a valid UUID' }),
  message: z.string().min(1, { message: 'content must be a non-empty string' }),
  messageHtml: z.string().min(1, { message: 'html string is required' }),
  type: z.string().min(1, { message: 'role is required' }),
});

const messageSchema = z.object({
  chatId: z.string().uuid({ message: 'chatId must be a valid UUID' }),
  messages: z.array(contentItemSchema).refine((val) => val.length > 0, {
    message: 'messages must contain at least one content item',
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, messages } = messageSchema.parse(body);
    const processedHtmls = formatMarkdown(messages);

    if (processedHtmls instanceof Error) {
      throw processedHtmls;
    }
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      const userId = '97569089-e110-4cae-b4f4-9c02cf5074e4';
      const title = 'Chat Title';
      await saveChat({ id: chatId, userId, title });
    }

    const promises = processedHtmls.map(async (message) => {
      const { messageId, type: role, markdown } = message;
      const messageExist = await getMessageById({ id: messageId });

      if (messageExist.length) {
        return updateMessage({ id: messageId, newData: { content: markdown } });
      } else {
        return saveMessage({ chatId, role, content: markdown, messageId });
      }
    });

    await Promise.all(promises);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Chat sent successfully',
        chatUrl: `http://localhost:3000/chat/${chatId}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
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
        },
      );
    }

    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
