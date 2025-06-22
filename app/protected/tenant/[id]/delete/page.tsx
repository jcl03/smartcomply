import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function DeleteTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const currentUserProfile = await getUserProfile();
  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return redirect("/protected");
  }

  const { data: tenant, error } = await supabase
    .from("tenant")
    .select("id, name")
    .eq("id", id)
    .single();
  if (error || !tenant) return redirect("/protected/tenant");

  async function handleDeleteTenant() {
    "use server";
    const supabase = await createClient();
    await supabase.from("tenant").delete().eq("id", id);
    redirect("/protected/tenant");
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Delete Tenant</h1>
        <p className="mb-4">Are you sure you want to delete tenant <span className="font-semibold">{tenant.name}</span>?</p>
        <form action={handleDeleteTenant}>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Tenant
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
