import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Heart,
  Shield,
} from 'lucide-react';

const coreConceptCards = [
  {
    title: 'Budgeting Basics',
    description: 'Help learners understand income vs expenses, needs vs wants, and creating simple budgets.',
    icon: Target,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Understanding Debt',
    description: 'Explain borrowing concepts, APR, and the importance of seeking help early with debt problems.',
    icon: Shield,
    color: 'bg-warning/10 text-warning',
  },
  {
    title: 'Consumer Rights',
    description: 'Cover key Irish and EU consumer protections, returns policies, and making effective complaints.',
    icon: CheckCircle,
    color: 'bg-government/10 text-government',
  },
  {
    title: 'Digital Safety',
    description: 'Address online scams, phishing, protecting personal financial information in the digital age.',
    icon: Shield,
    color: 'bg-destructive/10 text-destructive',
  },
  {
    title: 'Financial Wellbeing',
    description: 'Connect financial health with overall wellbeing. Reduce money-related stress and anxiety.',
    icon: Heart,
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Tax & Employment',
    description: 'Explain payslips, PAYE, USC, PRSI for learners entering the workforce.',
    icon: GraduationCap,
    color: 'bg-info/10 text-info',
  },
];

const integrationIdeas = [
  {
    subject: 'Mathematics',
    ideas: ['Percentage calculations with interest rates', 'Budgeting spreadsheets', 'Data analysis of spending patterns'],
  },
  {
    subject: 'SPHE',
    ideas: ['Financial decision-making', 'Peer pressure and spending', 'Wellbeing and money stress'],
  },
  {
    subject: 'Business Studies',
    ideas: ['Personal finance units', 'Consumer rights case studies', 'Entrepreneurship projects'],
  },
  {
    subject: 'CSPE',
    ideas: ['Consumer citizenship', 'Financial inclusion', 'Rights and responsibilities'],
  },
  {
    subject: 'Transition Year',
    ideas: ['Mini-company finances', 'Real-world budgeting simulations', 'Career and money planning'],
  },
  {
    subject: 'Home Economics',
    ideas: ['Household budgeting', 'Smart shopping', 'Value for money'],
  },
];

export default function StartHerePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <GraduationCap className="h-3 w-3 mr-1" />
              Getting Started
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Start Here: Your Financial Literacy Guide
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              New to financial literacy? This guide provides plain-language core concepts 
              for learners and educators alike. You don't need a finance background 
              to build essential money skills.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">No finance background needed</Badge>
              <Badge variant="outline">Practical guidance</Badge>
              <Badge variant="outline">Irish-focused</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* Our Promise */}
        <Card className="mb-12 border-l-4 border-l-primary">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Our Promise to You</h2>
                <p className="text-muted-foreground mb-4">
                  Every resource on FlitHub is reviewed to ensure it is:
                </p>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Non-promotional (no product pushing)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Appropriate for Irish learners</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Educationally sound</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Neutral and balanced</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Concepts */}
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Core Concepts in Plain Language
            </h2>
            <p className="text-muted-foreground">
              Key financial literacy topics explained simply
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreConceptCards.map((concept) => (
              <Card key={concept.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${concept.color} flex items-center justify-center mb-2`}>
                    <concept.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{concept.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{concept.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Subject Integration */}
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Integration Ideas by Subject
            </h2>
            <p className="text-muted-foreground">
              Financial literacy doesn't need its own timetable slot—weave it into what you already teach
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationIdeas.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {subject.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subject.ideas.map((idea, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Priority Groups */}
        <section className="mb-12">
          <Card className="bg-muted/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold mb-2">Reaching Priority Groups</h2>
                  <p className="text-muted-foreground">
                    Ireland's Financial Literacy Strategy identifies groups who may benefit most from 
                    accessible, culturally appropriate financial education.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Groups to Consider</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Women</Badge>
                    <Badge variant="secondary">Older Adults</Badge>
                    <Badge variant="secondary">New Communities</Badge>
                    <Badge variant="secondary">Traveller & Roma</Badge>
                    <Badge variant="secondary">Low Income</Badge>
                    <Badge variant="secondary">Young Adults</Badge>
                    <Badge variant="secondary">Carers</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Teaching Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Use relatable, everyday examples
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Focus on practical skills over theory
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Create safe spaces to discuss money
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Highlight peer-led and community models
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Ready to Explore Resources?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Browse our curated collection of lesson plans, worksheets, videos, and more—all 
            reviewed for quality and aligned with Irish educational standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/resources">
                <BookOpen className="h-5 w-5" />
                Browse Resources
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/providers">
                View Trusted Providers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
