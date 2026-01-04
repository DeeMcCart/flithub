import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllResources } from '@/hooks/useAdminResources';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { RESOURCE_TYPES } from '@/lib/constants';
import type { ReviewStatus } from '@/types/database';

const statusConfig: Record<ReviewStatus, { label: string; icon: React.ReactNode; className: string }> = {
  approved: { 
    label: 'Approved', 
    icon: <CheckCircle className="h-3 w-3" />, 
    className: 'bg-[hsl(158,64%,42%)] text-white' 
  },
  pending: { 
    label: 'Pending', 
    icon: <Clock className="h-3 w-3" />, 
    className: 'bg-[hsl(38,92%,50%)] text-foreground' 
  },
  needs_changes: { 
    label: 'Needs Changes', 
    icon: <AlertCircle className="h-3 w-3" />, 
    className: 'bg-[hsl(35,85%,55%)] text-foreground' 
  },
  rejected: { 
    label: 'Rejected', 
    icon: <XCircle className="h-3 w-3" />, 
    className: 'bg-[hsl(0,72%,51%)] text-white' 
  },
};

export default function AdminResources() {
  const navigate = useNavigate();
  const { data: resources, isLoading } = useAllResources();

  const handleRowClick = (resourceId: string) => {
    navigate(`/admin/resources/${resourceId}/edit`);
  };

  const getResourceTypeLabel = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">All Resources</h1>
            <p className="text-muted-foreground">
              Manage all resources in the system
            </p>
          </div>
          <Button onClick={() => navigate('/admin/add-resource')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => {
                  const status = resource.review_status || 'pending';
                  const statusInfo = statusConfig[status];
                  
                  return (
                    <TableRow 
                      key={resource.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(resource.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="max-w-md truncate">
                          {resource.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getResourceTypeLabel(resource.resource_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {resource.provider?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.className}>
                          <span className="flex items-center gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {resource.is_featured ? (
                          <Badge variant="outline" className="text-primary border-primary">
                            Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No resources found. Add your first resource to get started.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}