import { Layout } from '@/components/layout/Layout';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { useProviders } from '@/hooks/useProviders';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function ProvidersPage() {
  const { data: providers, isLoading, error } = useProviders();

  const groupedProviders = providers?.reduce((acc, provider) => {
    const type = provider.provider_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(provider);
    return acc;
  }, {} as Record<string, typeof providers>);

  const typeOrder = ['government', 'independent', 'community', 'international'];
  const typeLabels: Record<string, { title: string; description: string }> = {
    government: {
      title: 'Government & Statutory Bodies',
      description: 'Official Irish government agencies and statutory bodies providing financial education resources.',
    },
    independent: {
      title: 'Independent Educators',
      description: 'Non-profit organisations and independent educators delivering quality financial education.',
    },
    community: {
      title: 'Community-Led Initiatives',
      description: 'Grassroots and peer-led programmes supporting community financial wellbeing.',
    },
    international: {
      title: 'International Resources',
      description: 'Globally recognised financial education initiatives and award programmes.',
    },
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Trusted Providers
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            FlitHub curates resources from trusted organisations committed to non-promotional, 
            quality financial education. All providers are reviewed to ensure alignment with 
            Irish educational standards and our neutrality policy.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full badge-government" />
              Government
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full badge-independent" />
              Independent
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full badge-community" />
              Community
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full badge-international" />
              International
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load providers. Please try again later.
            </AlertDescription>
          </Alert>
        ) : providers && providers.length > 0 ? (
          <div className="space-y-12">
            {typeOrder.map(type => {
              const typeProviders = groupedProviders?.[type];
              if (!typeProviders || typeProviders.length === 0) return null;

              return (
                <section key={type}>
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-bold mb-2">
                      {typeLabels[type].title}
                    </h2>
                    <p className="text-muted-foreground">
                      {typeLabels[type].description}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {typeProviders.map(provider => (
                      <ProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground">
              Check back soon for trusted provider listings.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
