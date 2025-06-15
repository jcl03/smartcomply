"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChecklistPage({ params }: { params: Promise<{ id: string; checklistId: string }> }) {
  const router = useRouter();
  
  useEffect(() => {
    async function redirect() {
      const { id, checklistId } = await params;
      // Create a new route to avoid nesting issues
      const redirectPath = `/protected/compliance/${id}/checklist-fill/${checklistId}`;
      router.push(redirectPath);
    }
    redirect();
  }, [params, router]);
  return (
    <div className="p-8 flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3">Redirecting to checklist form...</span>
    </div>
  );
}
