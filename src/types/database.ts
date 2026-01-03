// FLITHUB Database Types

export type ProviderType = 'government' | 'independent' | 'international' | 'community';
export type ResourceLevel = 'primary' | 'junior_cycle' | 'transition_year' | 'senior_cycle' | 'lca' | 'adult_community';
export type ResourceType = 'lesson_plan' | 'slides' | 'worksheet' | 'project_brief' | 'video' | 'quiz' | 'guide' | 'interactive';
export type ReviewStatus = 'pending' | 'approved' | 'needs_changes' | 'rejected';
export type AppRole = 'admin' | 'submitter' | 'user';

export interface Provider {
  id: string;
  name: string;
  country: string;
  provider_type: ProviderType;
  description: string | null;
  target_audience: string[] | null;
  website_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string[] | null;
  duration_minutes: number | null;
  levels: ResourceLevel[];
  segments: string[] | null;
  topics: string[];
  resource_type: ResourceType;
  curriculum_tags: string[] | null;
  external_url: string | null;
  provider_id: string | null;
  submitted_by: string | null;
  review_status: ReviewStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  provider?: Provider;
  average_rating?: number;
  rating_count?: number;
}

export interface Rating {
  id: string;
  resource_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  organisation: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// Filter types
export interface ResourceFilters {
  levels?: ResourceLevel[];
  segments?: string[];
  topics?: string[];
  types?: ResourceType[];
  search?: string;
  providerId?: string;
}
