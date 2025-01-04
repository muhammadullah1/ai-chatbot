import { getChatById } from '@/lib/db/queries';

export async function GET() {

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatById({ id: '2856332a-e2fa-4f2d-a2f5-eef6d29ae28d' });
  return Response.json(chats);
}
