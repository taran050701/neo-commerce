import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { GlassShell } from '@/components/layout/glass-shell';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/sign-in?callbackUrl=/admin/dashboard');
  }

  return (
    <GlassShell className="gap-10 pt-16">
      <AdminTopbar />
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-slate-100">Admin Control Center</h1>
        <AdminNav />
      </div>
      {children}
    </GlassShell>
  );
}
