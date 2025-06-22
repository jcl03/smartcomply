export type UserProfile = {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  tenant_id: number | null;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isRevoked?: boolean;
};

export type Certificate = {
  id: number;
  upload_date: string;
  expiration: string | null;
  audit_id: number | null;
  checklist_responses_id: number | null;
  status: 'active' | 'archived' | 'expired';
  tenant_id: number;
  link?: any; // For backward compatibility
  created_at?: string; // For backward compatibility
  folder?: string | null; // For backward compatibility
};

export type Audit = {
  id: number;
  form_id: number;
  user_id: string;
  status: string;
  created_at: string;
  last_edit_at: string;
  result: 'pass' | 'failed' | null;
  marks: number;
  percentage: number;
  comments: string;
  title: string;
  audit_data: any;
  verification_status: 'pending' | 'accepted' | 'rejected' | null;
  verified_by: string | null;
  verified_at: string | null;
  corrective_action: string | null;
  tenant_id: number;
  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;
    status: string;
    date_created: string;
    compliance?: {
      id: number;
      name: string;
    };
  };
  user_profile?: {
    full_name: string;
    email: string;
  };
  verified_by_profile?: {
    full_name: string;
    email: string;
  };
  tenant?: {
    id: number;
    name: string;
  };
};

export type Form = {
  id: number;
  form_schema: any;
  compliance_id: number;
  status: 'active' | 'archive' | 'draft';
  date_created: string;
  threshold?: number;
  compliance?: {
    id: number;
    name: string;
  };
};

export type ActionResult = {
  success?: boolean;
  error?: string;
};
