'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/src/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminDashboard
        isOpen={true}
        onClose={() => router.push('/')}
        onBatchesUpdated={() => {}}
      />
    </div>
  );
}
