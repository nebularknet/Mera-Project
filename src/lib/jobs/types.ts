export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  featured: boolean;
  status: 'Open' | 'Closed';
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  linkedin?: string | null;
  portfolio?: string | null;
  resume_url: string;
  cover_letter?: string | null;
  message?: string | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  created_at: string;
}
