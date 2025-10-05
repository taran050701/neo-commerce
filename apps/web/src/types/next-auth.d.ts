import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      role: 'USER' | 'ADMIN' | 'AGENT';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'USER' | 'ADMIN' | 'AGENT';
  }
}
