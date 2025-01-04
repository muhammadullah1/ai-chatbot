import { saveMessageTest } from '@/lib/db/queries'

export async function POST(request: Request) {
  const {
    chatId,
    role,
    content,
  }: { id: string; chatId: string; role: string; content: object } =
    await request.json()
  await saveMessageTest({ chatId, role, content })
}
