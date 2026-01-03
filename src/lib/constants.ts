// FLITHUB Constants and Configuration

export const RESOURCE_LEVELS = [
  { value: 'primary', label: 'Primary', description: 'Primary school (ages 4-12)' },
  { value: 'junior_cycle', label: 'Junior Cycle', description: 'Junior Cycle (ages 12-15)' },
  { value: 'transition_year', label: 'Transition Year', description: 'TY (ages 15-16)' },
  { value: 'senior_cycle', label: 'Senior Cycle', description: 'Senior Cycle (ages 16-18)' },
  { value: 'lca', label: 'LCA', description: 'Leaving Certificate Applied' },
  { value: 'adult_community', label: 'Adult/Community', description: 'Adult and Community Education' },
] as const;

export const RESOURCE_SEGMENTS = [
  'Adults',
  'Older Adults',
  'Women',
  'Families',
  'Youth',
  'Carers',
  'Traveller',
  'New Communities',
  'Parents',
  'HomeBuyers',
  'Schools',
  'Teachers',
  'Low Income',
  'Educators',
] as const;

export const RESOURCE_TOPICS = [
  { value: 'Budgeting', icon: 'Calculator', color: 'primary' },
  { value: 'Earning', icon: 'Briefcase', color: 'success' },
  { value: 'Tax', icon: 'Receipt', color: 'info' },
  { value: 'Debt', icon: 'CreditCard', color: 'warning' },
  { value: 'Consumer Rights', icon: 'Shield', color: 'government' },
  { value: 'Fraud', icon: 'AlertTriangle', color: 'destructive' },
  { value: 'Digital Finance', icon: 'Smartphone', color: 'info' },
  { value: 'Entrepreneurship', icon: 'Lightbulb', color: 'accent' },
  { value: 'Financial Wellbeing', icon: 'Heart', color: 'success' },
  { value: 'Financial Planning', icon: 'Target', color: 'primary' },
  { value: 'Employment', icon: 'Building', color: 'government' },
] as const;

export const RESOURCE_TYPES = [
  { value: 'lesson_plan', label: 'Lesson Plan', icon: 'BookOpen' },
  { value: 'slides', label: 'Slides', icon: 'Presentation' },
  { value: 'worksheet', label: 'Worksheet', icon: 'FileText' },
  { value: 'project_brief', label: 'Project Brief', icon: 'FolderOpen' },
  { value: 'video', label: 'Video', icon: 'Video' },
  { value: 'quiz', label: 'Quiz', icon: 'HelpCircle' },
  { value: 'guide', label: 'Guide', icon: 'Book' },
  { value: 'interactive', label: 'Interactive', icon: 'MousePointer' },
] as const;

export const PROVIDER_TYPES = [
  { value: 'government', label: 'Government', description: 'Irish government bodies and statutory agencies' },
  { value: 'independent', label: 'Independent', description: 'Independent educators and non-profits' },
  { value: 'international', label: 'International', description: 'International organisations and resources' },
  { value: 'community', label: 'Community', description: 'Community-led and peer education initiatives' },
] as const;

export const CURRICULUM_TAGS = [
  'Junior Cycle Business Studies',
  'Junior Cycle Business',
  'SPHE',
  'CSPE',
  'Maths',
  'Primary Maths',
  'SESE',
  'TY',
  'LCA',
  'Adult Education',
  'Community Education',
] as const;

export const REVIEW_CRITERIA = [
  { key: 'educational_value', label: 'Educational Value', description: 'Clear learning objectives and pedagogical approach' },
  { key: 'clarity', label: 'Clarity', description: 'Content is well-structured and easy to understand' },
  { key: 'neutrality', label: 'Neutrality', description: 'No product promotion or commercial bias' },
  { key: 'irish_relevance', label: 'Irish Relevance', description: 'Appropriate for Irish learners and context' },
] as const;
