import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFiltersPanel } from '@/components/resources/ResourceFilters';
import { useResources } from '@/hooks/useResources';
import type { ResourceFilters } from '@/types/database';
import { Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResourcesPage() {
  const [searchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const initialFilters: ResourceFilters = {
    search: searchParams.get('search') || undefined,
    topics: searchParams.get('topic') ? [searchParams.get('topic')!] : undefined,
    providerId: searchParams.get('provider') || undefined,
  };

  const [filters, setFilters] = useState<ResourceFilters>(initialFilters);
  const { data: resources, isLoading, error } = useResources(filters);

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Resource Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse our collection of quality-reviewed financial literacy resources
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px,1fr] gap-8">
          {/* Filters Sidebar */}
          <aside>
            <ResourceFiltersPanel 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          </aside>

          {/* Results */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load resources. Please try again later.
                </AlertDescription>
              </Alert>
            ) : resources && resources.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
