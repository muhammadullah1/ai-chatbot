import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const res = NextResponse.next();

  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  return res;
}
