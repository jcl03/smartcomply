import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const currentUserProfile = await getUserProfile();
  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return redirect("/protected");
  }

  const { data: team, error } = await supabase
    .from("tenant")
    .select("id, name")
    .eq("id", id)
    .single();
  if (error || !team) return redirect("/protected/tenant");
  async function handleEditTeam(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return;
    const supabase = await createClient();
    await supabase.from("tenant").update({ name }).eq("id", id);
    redirect("/protected/tenant");
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Team</h1>
        <form action={handleEditTeam} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={team.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
