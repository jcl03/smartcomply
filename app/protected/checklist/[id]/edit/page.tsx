import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/api";
import ChecklistEditForm from "@/components/checklist/checklist-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChecklistEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Get user profile
  const userProfile = await getUserProfile();
  if (!userProfile) {
    return redirect("/sign-in");
  }

  // Fetch the checklist response
  const { data: response, error } = await supabase
    .from('checklist_responses')
    .select(`
      *,
      checklist (
        id,
        checklist_schema,
        compliance_id,
        compliance (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !response) {
    notFound();
  }

  // Check if user has permission to edit this response
  if (response.user_id !== user.id) {
    return redirect("/protected/checklist");
  }

  return (
    <ChecklistEditForm 
      response={response}
      userProfile={userProfile}
    />
  );
}
