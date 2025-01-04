export const config = {
  matcher: ['/', '/:id', '/api/:path*', '/login', '/register', '/api/test'],
}

export function middleware(req: { nextUrl: { pathname: any } }) {
  console.log('Request Path:', req.nextUrl.pathname)
}
