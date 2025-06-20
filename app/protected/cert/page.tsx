import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserProfile } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, Filter, FileText, Calendar, ExternalLink } from "lucide-react";
import { CertificateFilters } from "@/components/cert/certificate-filters";
import { CertificateList } from "@/components/cert/certificate-list";

interface SearchParams {
  search?: string;
  folder?: string;
  status?: string;
  expiring?: string;
  page?: string;
}

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Check if user has manager or admin role to add certificates
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  const canManageCerts = profile && ['admin', 'manager'].includes(profile.role);
  // Build query filters
  let query = supabase
    .from('cert')
    .select(`
      id,
      link,
      created_at,
      folder,
      expiration,
      upload_date,
      audit_id,
      checklist_responses_id
    `)
    .order('created_at', { ascending: false });

  // Apply search filter
  if (params.search) {
    query = query.or(`folder.ilike.%${params.search}%`);
  }

  // Apply folder filter
  if (params.folder) {
    query = query.eq('folder', params.folder);
  }

  // Apply expiring filter (certificates expiring in next 30 days)
  if (params.expiring === 'true') {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    query = query.lte('expiration', thirtyDaysFromNow.toISOString().split('T')[0]);
  }

  const { data: certificates, error: certsError } = await query;

  if (certsError) {
    console.error("Error fetching certificates:", certsError);
  }

  // Get unique folders for filter dropdown
  const { data: folders } = await supabase
    .from('cert')
    .select('folder')
    .not('folder', 'is', null);

  const uniqueFolders = Array.from(new Set(folders?.map(f => f.folder).filter(Boolean))) || [];

  // Calculate statistics
  const totalCerts = certificates?.length || 0;
  const expiringCerts = certificates?.filter(cert => {
    if (!cert.expiration) return false;
    const expirationDate = new Date(cert.expiration);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow;
  }).length || 0;

  const expiredCerts = certificates?.filter(cert => {
    if (!cert.expiration) return false;
    const expirationDate = new Date(cert.expiration);
    const today = new Date();
    return expirationDate < today;
  }).length || 0;

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your compliance certificates
            </p>
          </div>
          {canManageCerts && (
            <Link href="/protected/cert/add">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Certificate
              </Button>
            </Link>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCerts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{expiringCerts}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredCerts}</div>
              <p className="text-xs text-muted-foreground">Action required</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Folders</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueFolders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <CertificateFilters
          searchParams={params}
          folders={uniqueFolders}
        />

        {/* Certificate List */}
        <CertificateList 
          certificates={certificates || []}
          canManage={canManageCerts || false}
        />
      </div>
    </DashboardLayout>
  );
}
