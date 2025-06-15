import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, FileText } from "lucide-react";

export default async function ViewCompliancePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: complianceId } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  // Fetch compliance framework
  const { data: compliance, error: complianceError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', complianceId)
    .single();

  if (complianceError || !compliance) {
    return redirect("/protected/compliance");
  }

  // Fetch summary counts
  const { data: checklistsCount } = await supabase
    .from('checklist')
    .select('id')
    .eq('compliance_id', complianceId)
    .eq('status', 'active');

  const { data: formsCount } = await supabase
    .from('forms')
    .select('id')
    .eq('compliance_id', complianceId)
    .eq('status', 'active');

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-900">{compliance.name}</h1>
              <p className="text-sky-600 mt-1">View compliance framework details</p>
            </div>
            <Link href="/protected/compliance">
              <Button variant="outline">Back to All Frameworks</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href={`/protected/view-compliance/${complianceId}/checklists`}>
            <Card className="hover:shadow-md transition-all duration-200 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <CheckSquare className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sky-900">Checklists</h3>
                  <p className="text-sky-600">{checklistsCount?.length || 0} active checklists</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href={`/protected/view-compliance/${complianceId}/forms`}>
            <Card className="hover:shadow-md transition-all duration-200 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sky-900">Forms</h3>
                  <p className="text-sky-600">{formsCount?.length || 0} active forms</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
