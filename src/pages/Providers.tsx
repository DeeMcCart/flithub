import { Layout } from '@/components/layout/Layout';
import { useProviders } from '@/hooks/useProviders';
import { Loader2, Building2, AlertCircle, Landmark, GraduationCap, Users, Globe, CheckCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProviderType } from '@/types/database';

const providerIcons: Record<ProviderType, React.ElementType> = {
  government: Landmark,
  independent: GraduationCap,
  community: Users,
  international: Globe,
};

const providerColors: Record<ProviderType, string> = {
  government: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  independent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  community: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  international: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function ProvidersPage() {
  const { data: providers, isLoading, error } = useProviders();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    government: true,
    independent: true,
    community: true,
    international: true,
  });

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

  const toggleSection = (type: string) => {
    setOpenSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Trusted Providers
          </h1>
          <p className="text-muted-foreground mb-4">
            FlitHub curates resources from trusted organisations committed to non-promotional, 
            quality financial education. All providers are reviewed to ensure alignment with 
            Irish educational standards and our neutrality policy.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Government
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Independent
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Community
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
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
          <div className="space-y-6">
            {typeOrder.map(type => {
              const typeProviders = groupedProviders?.[type];
              if (!typeProviders || typeProviders.length === 0) return null;
              const Icon = providerIcons[type as ProviderType];

              return (
                <Collapsible
                  key={type}
                  open={openSections[type]}
                  onOpenChange={() => toggleSection(type)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <h2 className="font-display text-lg font-semibold">
                          {typeLabels[type].title}
                        </h2>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                          {typeProviders.length} provider{typeProviders.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[type] ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Provider</TableHead>
                            <TableHead className="hidden md:table-cell">Country</TableHead>
                            <TableHead className="hidden lg:table-cell">Target Audience</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeProviders.map(provider => (
                            <TableRow key={provider.id} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {provider.logo_url ? (
                                    <img 
                                      src={provider.logo_url} 
                                      alt={`${provider.name} logo`}
                                      className="h-8 w-8 rounded object-contain bg-muted flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{provider.name}</span>
                                      {provider.is_verified && (
                                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                      )}
                                    </div>
                                    {provider.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                        {provider.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="text-xs">
                                  {provider.country}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {provider.target_audience?.slice(0, 2).map((audience, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {audience}
                                    </Badge>
                                  ))}
                                  {provider.target_audience && provider.target_audience.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{provider.target_audience.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {provider.website_url && (
                                    <a
                                      href={provider.website_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      <span className="hidden sm:inline">Website</span>
                                    </a>
                                  )}
                                  <Link
                                    to={`/resources?provider=${provider.id}`}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Resources
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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
