import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';
import { Metadata } from 'next';
import { cn } from '@/lib/utils/cn';
import { AssistantProvider } from '@/components/assistant/assistant-provider';
import { AssistantPanel } from '@/components/assistant/assistant-panel';

export const metadata: Metadata = {
  title: 'NEO•COMMERCE – Futuristic AI-Driven Marketplace',
  description: 'Immersive glassmorphism e-commerce with built-in AI support, cart recovery, and personalized recommendations.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-midnight text-slate-100 hero-grid')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AssistantProvider>
            {children}
            <AssistantPanel />
            <Analytics />
          </AssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
