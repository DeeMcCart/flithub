# FlitHub - Ireland's Financial Literacy Resource Hub

[![Live Site](https://img.shields.io/badge/Live-flithub.ie-green)](https://flithub.ie)
[![Preview](https://img.shields.io/badge/Preview-lovable.app-blue)](https://flithub.lovable.app)

> Supporting Ireland's National Financial Literacy Strategy 2025-2029

FlitHub is a curated directory of quality-reviewed financial literacy resources for Irish learners, educators, and community groups. The platform connects trusted providers with priority demographics including young adults, older people, and those at risk of financial exclusion.

---

## 📋 Table of Contents

- [Live URLs](#-live-urls)
- [User Stories](#-user-stories)
- [Features](#-features)
- [Data Model](#-data-model)
- [Topic Taxonomy](#-topic-taxonomy)
- [Technology Stack](#-technology-stack)
- [Backend Functions](#-backend-functions)
- [Configuration](#-configuration)
- [Current State](#-current-state)
- [Future Considerations](#-future-considerations)
- [Development Setup](#-development-setup)
- [Deployment](#-deployment)

---

## 🌐 Live URLs

| Environment | URL |
|-------------|-----|
| Production | https://flithub.ie |
| Published | https://flithub.lovable.app |
| Preview | https://id-preview--b1959e4c-d3f4-4121-a77e-66a83d8d81db.lovable.app |

---

## 👥 User Stories

### For Learners
- ✅ Browse quality-reviewed financial literacy resources
- ✅ Filter resources by topic, type, education level, and target audience
- ✅ View detailed resource information including learning outcomes
- ✅ See ratings from other users
- ✅ Access external resources via safe external link warnings
- ✅ Explore topic pillars aligned with national strategy

### For Educators
- ✅ Find resources aligned with Irish curriculum (Junior Cycle Business, SPHE, Wellbeing, Home Economics)
- ✅ Filter by education level (Primary, Junior Cycle, Transition Year, Senior Cycle, LCA, Adult/Community)
- ✅ View trusted providers with verification status and credentials
- ✅ Use the "Start Here" guide to understand platform benefits
- ✅ Access curriculum-tagged resources for lesson planning

### For Administrators
- ✅ Add new resources via multi-step form wizard
- ✅ Manage review workflow (pending → approved/rejected/needs_changes)
- ✅ Create, edit, and delete providers
- ✅ Bulk import providers and resources via JSON
- ✅ Fetch provider logos automatically using Firecrawl
- ✅ Feature high-quality resources on homepage
- ✅ View dashboard statistics

---

## ✨ Features

### Public Features
| Feature | Description |
|---------|-------------|
| **Homepage** | Hero section, featured resources, topic pillars, strategic alignment messaging |
| **Resources Library** | Multi-faceted filtering (type, topic, provider, level, segment) |
| **Resource Detail** | Learning outcomes, curriculum tags, provider info, ratings display |
| **Providers Directory** | Categorized by type (government, independent, international, community) |
| **Start Here Guide** | Onboarding for newcomers to financial literacy |
| **External Link Warnings** | Safety confirmation before leaving site |
| **Smart Logo Component** | Fallback handling for missing provider logos |

### Authentication System
| Feature | Status |
|---------|--------|
| Email/password sign in & sign up | ✅ |
| Magic link (passwordless) auth | ✅ |
| Password reset flow | ✅ |
| Role-based access control | ✅ |

### Admin Portal
| Feature | Route |
|---------|-------|
| Dashboard with statistics | `/admin` |
| Add resource wizard | `/admin/resources/add` |
| Edit resources | `/admin/resources/:id/edit` |
| Pending review queue | `/admin/review/pending` |
| Approved resources | `/admin/review/approved` |
| Rejected resources | `/admin/review/rejected` |
| All resources management | `/admin/resources` |
| Provider management | `/admin/providers` |

### SEO & Metadata
- ✅ Canonical URL meta tag
- ✅ Open Graph image and tags
- ✅ Twitter Card meta tags
- ✅ JSON-LD structured data (WebSite, Organization, EducationalOrganization)
- ✅ Dynamic sitemap from approved resources
- ✅ robots.txt configuration

---

## 🗄️ Data Model

### Database Tables

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  profiles   │     │  providers  │     │  resources  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │◄────│ provider_id │
│ email       │     │ name        │     │ id (PK)     │
│ display_name│     │ provider_type│    │ title       │
│ organisation│     │ country     │     │ description │
│ created_at  │     │ description │     │ topics[]    │
│ updated_at  │     │ website_url │     │ levels[]    │
└─────────────┘     │ logo_url    │     │ resource_type│
                    │ is_verified │     │ review_status│
┌─────────────┐     │ target_audience│  │ external_url│
│ user_roles  │     └─────────────┘     │ learning_outcomes│
├─────────────┤                         │ curriculum_tags│
│ id (PK)     │     ┌─────────────┐     │ segments[]  │
│ user_id     │     │   ratings   │     │ is_featured │
│ role        │     ├─────────────┤     └─────────────┘
└─────────────┘     │ id (PK)     │           │
                    │ resource_id │◄──────────┘
                    │ user_id     │
                    │ stars       │
                    │ comment     │
                    │ is_approved │
                    └─────────────┘
```

### Enums

| Enum | Values |
|------|--------|
| `provider_type` | government, independent, international, community |
| `resource_type` | lesson_plan, slides, worksheet, project_brief, video, quiz, guide, interactive, podcast |
| `resource_level` | primary, junior_cycle, transition_year, senior_cycle, lca, adult_community |
| `review_status` | pending, approved, needs_changes, rejected |
| `app_role` | admin, submitter, user |

### Current Data (as of Jan 2025)
- **29 providers** across all provider types
- **9 approved resources** live on platform
- **0 pending** resources in review queue

---

## 📚 Topic Taxonomy

FlitHub organizes content around **6 Financial Pillars** aligned with Ireland's National Strategy:

### Core Pillars
1. **Financial Wellbeing & Foundations** - Understanding financial health and basic concepts
2. **Income & Expenditure** - Earning, spending, and cash flow management
3. **Saving & Investing** - Building wealth and understanding investment options
4. **Budgeting & Money Management** - Planning and tracking finances
5. **Borrowing & Debt** - Credit, loans, and debt management

### Special Pillar
6. **Fraud & Scams** - Protection against financial fraud (highlighted separately due to importance)

Each pillar contains subtopics that map to curriculum tags and learning outcomes.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library (Radix primitives) |
| TanStack React Query | Server state management |
| React Router DOM v6 | Client-side routing |
| React Hook Form + Zod | Form handling & validation |
| Lucide React | Icons |
| Framer Motion | Animations |

### Backend (Lovable Cloud)
| Service | Purpose |
|---------|---------|
| Database | PostgreSQL with RLS policies |
| Authentication | Email/password, magic link |
| Storage | Provider logos bucket |
| Edge Functions | Serverless API endpoints |

---

## ⚡ Backend Functions

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `sitemap` | Dynamic XML sitemap from approved resources | No |
| `import-providers` | Bulk JSON import of providers | Yes |
| `import-resources` | Bulk JSON import/upsert of resources | Yes |
| `fetch-provider-logos` | Automated logo scraping via Firecrawl | Yes |
| `admin-reset-password` | Admin password reset utility | Yes |

---

## ⚙️ Configuration

### Environment Variables (Auto-configured)
```env
VITE_SUPABASE_URL=<auto>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto>
VITE_SUPABASE_PROJECT_ID=<auto>
```

### Configured Secrets
| Secret | Purpose |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Edge function admin access |
| `FIRECRAWL_API_KEY` | Logo scraping (via connector) |

### Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `provider-logos` | Yes | Provider organization logos |

---

## 📊 Current State

### What's Working
- ✅ Full public browsing experience
- ✅ Resource filtering and search
- ✅ Provider directory
- ✅ Admin CRUD operations
- ✅ Review workflow
- ✅ Bulk import via JSON
- ✅ Logo fetching automation
- ✅ Dynamic sitemap generation
- ✅ SEO metadata

### Database Functions
```sql
-- Check if user has specific role
has_role(_user_id uuid, _role app_role) → boolean

-- Auto-create profile on signup
handle_new_user() → trigger

-- Auto-update timestamps
update_updated_at() → trigger
```

---

## 🚀 Future Considerations

### Not Yet Implemented
| Feature | Description |
|---------|-------------|
| **Automated Provider Updates** | Scheduled jobs to refresh provider data |
| **External API Endpoint** | Webhook for browser-user tool integration |
| **Rating Submission UI** | Form for users to submit ratings (table exists) |
| **Realtime Updates** | Live updates when resources change |
| **User Favourites** | Save resources for later |
| **Resource Recommendations** | AI-powered suggestions |

### Integration Points Planned
- **browser-user tool** - External automation for provider updates
- **Scheduled refresh** - Periodic provider data validation

---

## 💻 Development Setup

### Prerequisites
- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📦 Deployment

### Frontend
1. Open [Lovable](https://lovable.dev)
2. Click **Share → Publish**
3. Updates deploy automatically on publish

### Backend (Edge Functions)
- Auto-deployed on file save
- No manual deployment required

### Custom Domain
1. Navigate to **Project → Settings → Domains**
2. Click **Connect Domain**
3. Configure DNS as instructed
4. Domain: `flithub.ie`

---

## 📄 License

This project supports Ireland's National Financial Literacy Strategy 2025-2029.

---

## 🙏 Acknowledgments

- Ireland's National Financial Literacy Strategy
- All contributing providers and educators
- Built with [Lovable](https://lovable.dev)

---

*Made with ❤️ in Ireland*
