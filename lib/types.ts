export type UserProfile = {
  id: string;
  role: string;
  full_name: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isRevoked?: boolean;
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
  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;    status: string;
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
