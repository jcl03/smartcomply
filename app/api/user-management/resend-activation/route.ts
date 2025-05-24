import { NextRequest, NextResponse } from "next/server";
import { resendActivation } from "@/app/protected/user-management/actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// API route to handle resend activation requests
export async function POST(request: NextRequest) {
  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Process the request
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    const result = await resendActivation({ email: body.email });
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in resend activation API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" }, 
      { status: 500 }
    );
  }
}
