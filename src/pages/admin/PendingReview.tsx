import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ResourceQueue } from '@/components/admin/ResourceQueue';
import { ReviewPanel } from '@/components/admin/ReviewPanel';
import { usePendingResources } from '@/hooks/useAdminResources';
import { Resource } from '@/types/database';
import { Loader2 } from 'lucide-react';

export default function PendingReview() {
  const { data: resources, isLoading, error } = usePendingResources();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleComplete = () => {
    setSelectedResource(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">Failed to load pending resources</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex h-screen">
        {/* Queue Panel */}
        <div className="w-1/3 border-r bg-muted/30 overflow-auto">
          <div className="p-6">
            <h1 className="font-display text-xl font-bold mb-1">Pending Review</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {resources?.length || 0} resource{resources?.length !== 1 ? 's' : ''} awaiting review
            </p>
            <ResourceQueue 
              resources={resources || []} 
              selectedId={selectedResource?.id}
              onSelect={setSelectedResource}
            />
          </div>
        </div>

        {/* Review Panel */}
        <div className="flex-1 overflow-auto">
          {selectedResource ? (
            <ReviewPanel 
              resource={selectedResource} 
              onComplete={handleComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <h2 className="font-semibold text-lg mb-1">Select a resource to review</h2>
                <p className="text-muted-foreground text-sm">
                  Click on a resource from the queue to start reviewing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
