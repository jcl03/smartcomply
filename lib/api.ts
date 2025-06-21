import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { UserProfile } from "@/lib/types";

export async function getUserProfile() {
  const supabase = await createClient();
  
  // First get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Then fetch the profile for this specific user
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data as UserProfile;
}

export async function getAllUserProfiles() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*');
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
  
  return data as UserProfile[];
}

export async function getAllUserProfilesWithRevocationStatus() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*');
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }

  // Get revocation status for all users
  try {
    const adminClient = createAdminClient();
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError || !authUsers) {
      console.error("Error fetching auth users:", authError);
      return data.map(profile => ({ ...profile, isRevoked: false }));    }    // Map profiles with revocation status
    const profilesWithRevocationStatus = data.map(profile => {
      const authUser = authUsers.users.find(u => u.email === profile.email);
      let isRevoked = false;
      
      if (authUser) {
        // Check if user access is revoked based on metadata
        isRevoked = authUser.user_metadata?.revoked === true;
      }
      
      return { ...profile, isRevoked };
    });

    return profilesWithRevocationStatus;
  } catch (err) {    console.error("Error checking revocation status:", err);
    return data.map(profile => ({ ...profile, isRevoked: false }));
  }
}

export async function getAuditById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      audit_data,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        status,
        date_created,
        compliance:compliance_id (
          id,
          name,
          description
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching audit:", error);
    return null;
  }

  return data;
}

export async function getUserAudits(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        compliance:compliance_id (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user audits:", error);
    return [];
  }

  return data;
}

export async function getAllAudits() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        compliance:compliance_id (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all audits:", error);
    return [];
  }

  return data;
}

export async function getUserProfiles(userIds: string[]) {
  const supabase = await createClient();
  
  if (!userIds || userIds.length === 0) {
    return [];
  }
  
  // Try multiple approaches to get user profiles
  let profiles: any[] = [];
  
  // First try: view_user_profiles
  try {
    const { data: viewProfiles, error: viewError } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, email, role')
      .in('id', userIds);
    
    if (viewProfiles && viewProfiles.length > 0) {
      profiles = viewProfiles;
      console.log(`Got ${profiles.length} profiles from view_user_profiles`);
      return profiles;
    } else {
      console.log("view_user_profiles failed or empty:", viewError);
    }
  } catch (err) {
    console.log("view_user_profiles query failed:", err);
  }
  
  // Second try: profiles table
  try {
    const { data: directProfiles, error: directError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (directProfiles && directProfiles.length > 0) {
      profiles = directProfiles;
      console.log(`Got ${profiles.length} profiles from profiles table`);
      return profiles;
    } else {
      console.log("profiles table failed or empty:", directError);
    }
  } catch (err) {
    console.log("profiles table query failed:", err);
  }
  
  // Third try: user_profiles table
  try {
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (userProfiles && userProfiles.length > 0) {
      profiles = userProfiles;
      console.log(`Got ${profiles.length} profiles from user_profiles table`);
      return profiles;
    } else {
      console.log("user_profiles table failed or empty:", userError);
    }
  } catch (err) {
    console.log("user_profiles table query failed:", err);
  }
  
  // Fourth try: admin auth users (if available)
  try {
    const adminSupabase = createAdminClient();
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authUsers?.users) {
      profiles = authUsers.users
        .filter(authUser => userIds.includes(authUser.id))
        .map(authUser => ({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || 
                    authUser.user_metadata?.name || 
                    authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: authUser.user_metadata?.role || 'user'
        }));
      
      console.log(`Got ${profiles.length} profiles from auth.admin.listUsers`);
      return profiles;
    }
  } catch (err) {
    console.log("admin auth users query failed:", err);
  }
  
  return profiles;
}

export async function getCompliances() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compliance')
    .select('id, name, status');
  if (error) {
    console.error('Error fetching compliances:', error);
    return [];
  }
  return data || [];
}

// Dashboard-specific API functions
export async function getDashboardData(userRole: string, userId?: string) {
  const supabase = await createClient();
  
  try {
    // Get base compliance data
    const { data: compliance } = await supabase
      .from('compliance')
      .select('id, name, status')
      .eq('status', 'active');

    // Get audit data based on role
    let auditQuery = supabase
      .from('audit')
      .select(`
        id,
        user_id,
        status,
        created_at,
        result,
        marks,
        percentage,
        form:form_id (
          compliance_id,
          compliance:compliance_id (name)
        )
      `);

    // Filter by user for non-admin roles
    if (userRole !== 'admin' && userId) {
      auditQuery = auditQuery.eq('user_id', userId);
    }

    const { data: audits } = await auditQuery;

    // Get checklist responses
    let checklistQuery = supabase
      .from('checklist_responses')
      .select(`
        id,
        user_id,
        status,
        created_at,
        result,
        checklist:checklist_id (
          compliance_id,
          compliance:compliance_id (name)
        )
      `);

    if (userRole !== 'admin' && userId) {
      checklistQuery = checklistQuery.eq('user_id', userId);
    }

    const { data: checklistResponses } = await checklistQuery;

    // Get user profiles for admin dashboard
    let userProfiles: { id: string; full_name: string; email: string; role: string; created_at: string; last_sign_in_at: string }[] = [];
    if (userRole === 'admin') {
      const { data: profiles } = await supabase
        .from('view_user_profiles')
        .select('id, full_name, email, role, created_at, last_sign_in_at');
      userProfiles = profiles || [];
    }

    return {
      compliance: compliance || [],
      audits: audits || [],
      checklistResponses: checklistResponses || [],
      userProfiles
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      compliance: [],
      audits: [],
      checklistResponses: [],
      userProfiles: []
    };
  }
}

export async function getAuditorPerformanceData() {
  const supabase = await createClient();
  
  try {
    // Get all auditors and their performance
    const { data: auditors } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, role')
      .eq('role', 'auditor');

    const { data: audits } = await supabase
      .from('audit')
      .select('id, user_id, status, created_at, result, marks, percentage');

    const { data: checklistResponses } = await supabase
      .from('checklist_responses')
      .select('id, user_id, status, created_at, result');

    return {
      auditors: auditors || [],
      audits: audits || [],
      checklistResponses: checklistResponses || []
    };
  } catch (error) {
    console.error('Error fetching auditor performance data:', error);
    return {
      auditors: [],
      audits: [],
      checklistResponses: []
    };
  }
}

export async function getComplianceTrendsData() {
  const supabase = await createClient();
  
  try {
    // Get compliance trends over time
    const { data: audits } = await supabase
      .from('audit')
      .select(`
        id,
        created_at,
        result,
        status,
        form:form_id (
          compliance_id,
          compliance:compliance_id (id, name)
        )
      `)
      .order('created_at', { ascending: false });

    const { data: checklistResponses } = await supabase
      .from('checklist_responses')
      .select(`
        id,
        created_at,
        result,
        status,
        checklist:checklist_id (
          compliance_id,
          compliance:compliance_id (id, name)
        )
      `)
      .order('created_at', { ascending: false });

    return {
      audits: audits || [],
      checklistResponses: checklistResponses || []
    };
  } catch (error) {
    console.error('Error fetching compliance trends data:', error);
    return {
      audits: [],
      checklistResponses: []
    };
  }
}

// New API functions for story-driven visualizations

export async function getRiskTimelineData() {
  const supabase = await createClient();
  
  try {
    // Get upcoming audits and checklist responses with due dates
    const { data: audits } = await supabase
      .from('audit')
      .select(`
        id,
        title,
        created_at,
        status,
        percentage,
        user_id,
        form:form_id (
          compliance:compliance_id (name)
        )
      `)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    const { data: userProfiles } = await supabase
      .from('view_user_profiles')
      .select('id, full_name');

    return {
      audits: audits || [],
      userProfiles: userProfiles || []
    };
  } catch (error) {
    console.error('Error fetching risk timeline data:', error);
    return {
      audits: [],
      userProfiles: []
    };
  }
}

export async function getWorkloadData() {
  const supabase = await createClient();
  
  try {
    // Get auditor workload data
    const { data: audits } = await supabase
      .from('audit')
      .select(`
        id,
        user_id,
        created_at,
        status,
        percentage
      `)
      .order('created_at', { ascending: false });

    const { data: checklistResponses } = await supabase
      .from('checklist_responses')
      .select(`
        id,
        user_id,
        created_at,
        status
      `)
      .order('created_at', { ascending: false });

    const { data: userProfiles } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, role');

    return {
      audits: audits || [],
      checklistResponses: checklistResponses || [],
      userProfiles: userProfiles || []
    };
  } catch (error) {
    console.error('Error fetching workload data:', error);
    return {
      audits: [],
      checklistResponses: [],
      userProfiles: []
    };
  }
}

export async function getComplianceHealthData() {
  const supabase = await createClient();
  
  try {
    // Get daily compliance health data
    const { data: audits } = await supabase
      .from('audit')
      .select(`
        id,
        created_at,
        status,
        result,
        form:form_id (
          compliance:compliance_id (name)
        )
      `)
      .order('created_at', { ascending: false });

    const { data: checklistResponses } = await supabase
      .from('checklist_responses')
      .select(`
        id,
        created_at,
        status,
        result,
        checklist:checklist_id (
          compliance:compliance_id (name)
        )
      `)
      .order('created_at', { ascending: false });

    return {
      audits: audits || [],
      checklistResponses: checklistResponses || []
    };
  } catch (error) {
    console.error('Error fetching compliance health data:', error);
    return {
      audits: [],
      checklistResponses: []
    };
  }
}

export async function getPerformanceRadarData() {
  const supabase = await createClient();
  
  try {
    // Get detailed auditor performance data
    const { data: auditors } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, role')
      .eq('role', 'auditor');

    const { data: audits } = await supabase
      .from('audit')
      .select(`
        id,
        user_id,
        status,
        result,
        marks,
        percentage,
        created_at,
        form:form_id (
          compliance:compliance_id (name)
        )
      `);

    return {
      auditors: auditors || [],
      audits: audits || []
    };
  } catch (error) {
    console.error('Error fetching performance radar data:', error);
    return {
      auditors: [],
      audits: []
    };
  }
}
