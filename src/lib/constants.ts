// FLITHUB Constants and Configuration

export const RESOURCE_LEVELS = [
  { value: "primary", label: "School - Primary", description: "Primary school (ages 4-12)" },
  { value: "junior_cycle", label: "Junior Cycle", description: "Junior Cycle (ages 12-15)" },
  { value: "transition_year", label: "Transition Year", description: "TY (ages 15-16)" },
  { value: "senior_cycle", label: "Senior Cycle", description: "Senior Cycle (ages 16-18)" },
  { value: "lca", label: "LCA", description: "Leaving Certificate Applied" },
  { value: "adult_community", label: "Adult/Community", description: "Adult and Community Education" },
  { value: "secondary", label: "School - Secondary", description: "Secondary school (ages 12-19)" },
  { value: "ya", label: "Young Adult/ YouthReach", description: "Young Adult" },
] as const;

export const RESOURCE_SEGMENTS = [
  "Adults",
  "Older Adults",
  "Women",
  "Families",
  "Youth",
  "Carers",
  "Traveller",
  "New Communities",
  "Parents",
  "HomeBuyers",
  "Schools",
  "Teachers",
  "Low Income",
  "Educators",
] as const;

export const RESOURCE_TOPICS = [
  // Financial Wellbeing & Foundations
  { value: "Financial Wellbeing", icon: "Heart", color: "success" },
  { value: "Consumer Rights", icon: "Shield", color: "government" },
  { value: "Digital Finance", icon: "Smartphone", color: "info" },
  // Income & Expenditure
  { value: "Tax", icon: "Receipt", color: "info" },
  { value: "Employment", icon: "Building", color: "government" },
  { value: "Understanding Entitlements", icon: "FileCheck", color: "government" },
  // Saving & Investing
  { value: "Saving Strategies", icon: "PiggyBank", color: "success" },
  { value: "Investment Basics", icon: "TrendingUp", color: "primary" },
  // Budgeting & Money Management
  { value: "Budgeting", icon: "Calculator", color: "primary" },
  { value: "Spending Control", icon: "Wallet", color: "accent" },
  // Borrowing & Debt
  { value: "Debt", icon: "CreditCard", color: "warning" },
  { value: "Credit & Loans", icon: "Landmark", color: "info" },
  { value: "When Things Go Wrong", icon: "AlertCircle", color: "destructive" },
  // Fraud & Scams
  { value: "Recognizing Scams", icon: "Eye", color: "destructive" },
  { value: "Protecting Yourself", icon: "ShieldCheck", color: "destructive" },
  { value: "Reporting & Recovery", icon: "FileWarning", color: "destructive" },
  // Legacy values for backwards compatibility
  { value: "Earning", icon: "Briefcase", color: "success" },
  { value: "Fraud", icon: "AlertTriangle", color: "destructive" },
  { value: "Entrepreneurship", icon: "Lightbulb", color: "accent" },
  { value: "Financial Planning", icon: "Target", color: "primary" },
] as const;

export const FINANCIAL_PILLARS = [
  {
    id: "wellbeing",
    title: "Financial Wellbeing & Foundations",
    icon: "Heart",
    color: "success",
    description: "Build a strong foundation for your financial life",
    subtopics: [
      { value: "Financial Wellbeing", label: "Financial Wellbeing", icon: "Heart" },
      { value: "Consumer Rights", label: "Consumer Rights", icon: "Shield" },
      { value: "Digital Finance", label: "Digital Finance", icon: "Smartphone" },
    ],
  },
  {
    id: "income",
    title: "Income & Expenditure",
    icon: "Briefcase",
    color: "info",
    description: "Understand your income, taxes, and entitlements",
    subtopics: [
      { value: "Tax", label: "Tax & Employment", icon: "Receipt" },
      { value: "Understanding Entitlements", label: "Understanding Entitlements", icon: "FileCheck" },
    ],
  },
  {
    id: "saving",
    title: "Saving & Investing",
    icon: "PiggyBank",
    color: "primary",
    description: "Grow your money through saving and investing",
    subtopics: [
      { value: "Saving Strategies", label: "Saving Strategies", icon: "PiggyBank" },
      { value: "Investment Basics", label: "Investment Basics", icon: "TrendingUp" },
    ],
  },
  {
    id: "budgeting",
    title: "Budgeting & Money Management",
    icon: "Calculator",
    color: "accent",
    description: "Take control of your day-to-day finances",
    subtopics: [
      { value: "Budgeting", label: "Budgeting Basics", icon: "Calculator" },
      { value: "Spending Control", label: "Spending Control", icon: "Wallet" },
    ],
  },
  {
    id: "debt",
    title: "Borrowing & Debt",
    icon: "CreditCard",
    color: "warning",
    description: "Navigate borrowing, credit, and debt management",
    subtopics: [
      { value: "Debt", label: "Understanding Debt", icon: "CreditCard" },
      { value: "Credit & Loans", label: "Credit & Loans", icon: "Landmark" },
      { value: "When Things Go Wrong", label: "When Things Go Wrong", icon: "AlertCircle" },
    ],
  },
] as const;

export const FRAUD_PILLAR = {
  id: "fraud",
  title: "Fraud & Scams",
  icon: "ShieldAlert",
  color: "destructive",
  description: "Protect yourself from financial fraud and scams",
  subtopics: [
    { value: "Recognizing Scams", label: "Recognizing Scams", icon: "Eye" },
    { value: "Protecting Yourself", label: "Protecting Yourself", icon: "ShieldCheck" },
    { value: "Reporting & Recovery", label: "Reporting & Recovery", icon: "FileWarning" },
  ],
} as const;

export const RESOURCE_TYPES = [
  { value: "lesson_plan", label: "Lesson Plan", icon: "BookOpen" },
  { value: "slides", label: "Slides", icon: "Presentation" },
  { value: "worksheet", label: "Worksheet", icon: "FileText" },
  { value: "project_brief", label: "Project Brief", icon: "FolderOpen" },
  { value: "video", label: "Video", icon: "Video" },
  { value: "quiz", label: "Quiz", icon: "HelpCircle" },
  { value: "guide", label: "Guide", icon: "Book" },
  { value: "interactive", label: "Interactive", icon: "MousePointer" },
] as const;

export const PROVIDER_TYPES = [
  { value: "government", label: "Government", description: "Irish government bodies and statutory agencies" },
  { value: "independent", label: "Independent", description: "Independent educators and non-profits" },
  { value: "international", label: "International", description: "International organisations and resources" },
  { value: "community", label: "Community", description: "Community-led and peer education initiatives" },
] as const;

export const CURRICULUM_TAGS = [
  "Junior Cycle Business Studies",
  "Junior Cycle Business",
  "SPHE",
  "CSPE",
  "Maths",
  "Primary Maths",
  "SESE",
  "TY",
  "LCA",
  "Adult Education",
  "Community Education",
] as const;

export const REVIEW_CRITERIA = [
  {
    key: "educational_value",
    label: "Educational Value",
    description: "Clear learning objectives and pedagogical approach",
  },
  { key: "clarity", label: "Clarity", description: "Content is well-structured and easy to understand" },
  { key: "neutrality", label: "Neutrality", description: "No product promotion or commercial bias" },
  { key: "irish_relevance", label: "Irish Relevance", description: "Appropriate for Irish learners and context" },
] as const;
