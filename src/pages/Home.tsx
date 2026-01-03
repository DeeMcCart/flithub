import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { useFeaturedResources } from '@/hooks/useResources';
import { 
  BookOpen, 
  Users, 
  Shield, 
  ArrowRight, 
  Calculator, 
  CreditCard, 
  Smartphone, 
  Heart,
  Building2,
  GraduationCap,
  Sparkles
} from 'lucide-react';

const topicQuickLinks = [
  { icon: Calculator, label: 'Budgeting', color: 'bg-primary/10 text-primary' },
  { icon: CreditCard, label: 'Debt', color: 'bg-warning/10 text-warning' },
  { icon: Shield, label: 'Consumer Rights', color: 'bg-government/10 text-government' },
  { icon: Smartphone, label: 'Digital Finance', color: 'bg-info/10 text-info' },
  { icon: Heart, label: 'Financial Wellbeing', color: 'bg-success/10 text-success' },
  { icon: Building2, label: 'Tax & Employment', color: 'bg-government/10 text-government' },
];

export default function HomePage() {
  const { data: featuredResources, isLoading } = useFeaturedResources();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Ireland's Financial Literacy Resource Hub
            </Badge>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Trusted Resources for{' '}
              <span className="text-primary">Financial Education</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A curated collection of non-promotional, quality-reviewed financial literacy resources 
              for educators, teachers, and community groups across Ireland.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/resources">
                  <BookOpen className="h-5 w-5" />
                  Browse Resources
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/start-here">
                  <GraduationCap className="h-5 w-5" />
                  For Educators
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Our Promise */}
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">No Product Promotion</p>
                <p className="text-sm text-muted-foreground">Purely educational content</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Quality Reviewed</p>
                <p className="text-sm text-muted-foreground">All resources are vetted</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Irish Focused</p>
                <p className="text-sm text-muted-foreground">Aligned with Irish curriculum</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Topic Links */}
      <section className="container py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Explore by Topic</h2>
          <p className="text-muted-foreground">Find resources on the topics that matter most</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topicQuickLinks.map((topic) => (
            <Link 
              key={topic.label} 
              to={`/resources?topic=${encodeURIComponent(topic.label)}`}
              className="group"
            >
              <Card className="h-full hover:shadow-md transition-all hover:border-primary/50">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl ${topic.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{topic.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Featured Resources</h2>
            <p className="text-muted-foreground">Hand-picked quality resources for educators</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex gap-2">
            <Link to="/resources">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources?.slice(0, 6).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/resources">
              View All Resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* For Educators CTA */}
      <section className="container py-12">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  New to Teaching Financial Literacy?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Our "Start Here" guide provides plain-language core concepts and practical guidance 
                  for non-specialist teachers. Discover how to integrate financial education into 
                  your existing subjects.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button asChild size="lg">
                    <Link to="/start-here">
                      Start Here Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/providers">
                      View Trusted Providers
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="w-48 h-48 bg-primary/10 rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-24 w-24 text-primary/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Strategic Alignment */}
      <section className="bg-muted/50 border-t">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Strategic Alignment</Badge>
            <h2 className="font-display text-2xl font-bold mb-4">
              Supporting Ireland's National Financial Literacy Strategy 2025-2029
            </h2>
            <p className="text-muted-foreground mb-6">
              FlitHub is designed to support the national strategy by improving coordination and visibility 
              of financial education tools, facilitating systematic integration for teachers, and ensuring 
              resources reach priority groups including women, older adults, migrants, and those with 
              lower financial literacy.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Teacher Support</Badge>
              <Badge variant="secondary">Priority Groups</Badge>
              <Badge variant="secondary">Curriculum Aligned</Badge>
              <Badge variant="secondary">Quality Assured</Badge>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
