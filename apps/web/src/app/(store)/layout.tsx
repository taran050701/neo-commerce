import { ReactNode } from 'react';
import { GlassShell } from '@/components/layout/glass-shell';
import { StoreHeader } from '@/components/layout/store-header';
import { StoreFooter } from '@/components/layout/store-footer';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <GlassShell>
      <StoreHeader />
      <main className="flex flex-1 flex-col gap-10">{children}</main>
      <StoreFooter />
    </GlassShell>
  );
}
