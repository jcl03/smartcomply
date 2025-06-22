export type Tenant = {
  id: number;
  name: string;
};

export type UserProfileWithTenant = {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  tenant_id: number | null;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isRevoked?: boolean;
  tenant?: Tenant;
};
