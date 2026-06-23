'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { MilitaireProvider } from '@/context/MilitaireContext';
import { useAuth } from '@/context/AuthContext';

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5a705a]">Chargement MILSYS RDC...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <MilitaireProvider>
        <div className="flex min-h-screen bg-[#0a0f0a]">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
      </MilitaireProvider>
    </DashboardGuard>
  );
}
