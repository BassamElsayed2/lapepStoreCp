export interface ProfileTypes {
  id?: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  job_title?: string;
  address?: string;
  joined_at?: string | Date | number;
  created_at?: string;
  image_url?: string;
  avatar_url?: string;
  about?: string;
  phone?: number | string;
  name?: string | null;
  role?: string;
  email_verified?: boolean;
  updated_at?: string;
}
