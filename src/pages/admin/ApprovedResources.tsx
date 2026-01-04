import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllResources } from '@/hooks/useAdminResources';
import { Card, CardContent } from '@/components/ui/card';
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
import { ExternalLink, Star, Building2, Loader2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { RESOURCE_TYPES } from '@/lib/constants';

export default function ApprovedResources() {
  const { data: resources, isLoading } = useAllResources('approved');
  const navigate = useNavigate();

  const getTypeLabel = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.label || type;
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

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Approved Resources</h1>
          <p className="text-muted-foreground">
            {resources?.length || 0} published resources
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources?.map((resource) => (
                  <TableRow 
                    key={resource.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                  >
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium truncate">{resource.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {resource.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getTypeLabel(resource.resource_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resource.provider ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3 w-3" />
                          {resource.provider.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {resource.is_featured && (
                        <Star className="h-4 w-4 text-warning fill-warning" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.reviewed_at 
                        ? formatDistanceToNow(new Date(resource.reviewed_at), { addSuffix: true })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/resources/${resource.id}/edit`);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {resource.external_url && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => e.stopPropagation()}
                            asChild
                          >
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {resources?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No approved resources yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
