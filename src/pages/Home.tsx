import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { TopicPillars } from '@/components/home/TopicPillars';
import { useFeaturedResources } from '@/hooks/useResources';
import { 
  BookOpen, 
  Users, 
  Shield, 
  ArrowRight, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import heroImage from '@/assets/hero-image.png';



export default function HomePage() {
  const { data: featuredResources, isLoading } = useFeaturedResources();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Ireland's Financial Literacy Resource Hub
              </Badge>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Trusted Resources for{' '}
                <span className="text-primary">Ireland's Financial Literacy</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl lg:max-w-none">
                A curated collection of non-promotional, quality-reviewed financial literacy resources 
                for everyone—learners, educators, and community groups across Ireland.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/resources">
                    <BookOpen className="h-5 w-5" />
                    Browse Resources
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/start-here">
                    <GraduationCap className="h-5 w-5" />
                    Start Here
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Diverse group of people collaborating on financial literacy education" 
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
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

      {/* Topic Pillars */}
      <TopicPillars />

      {/* Featured Resources */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Featured Resources</h2>
            <p className="text-muted-foreground">Hand-picked quality resources to get you started</p>
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

      {/* Start Here CTA */}
      <section className="container py-12">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  New to Financial Literacy?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Our "Start Here" guide provides plain-language core concepts and practical guidance 
                  for learners and educators alike. Discover the key topics that will help you build 
                  financial confidence.
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
              of financial education tools, making resources accessible to everyone, and ensuring 
              they reach priority groups including women, older adults, migrants, and those building 
              their financial confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">For Everyone</Badge>
              <Badge variant="secondary">Priority Groups</Badge>
              <Badge variant="secondary">Irish Focused</Badge>
              <Badge variant="secondary">Quality Assured</Badge>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
