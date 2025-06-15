"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChecklistPage({ params }: { params: { id: string; checklistId: string } }) {
  const router = useRouter();
  
  useEffect(() => {
    // Create a new route to avoid nesting issues
    const redirectPath = `/protected/compliance/${params.id}/checklist-fill/${params.checklistId}`;
    router.push(redirectPath);
  }, [params, router]);
  
  return (
    <div className="p-8 flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3">Redirecting to checklist form...</span>
    </div>
  );
}
