import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileStack, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllResources, usePendingResources } from '@/hooks/useAdminResources';

export default function AdminDashboard() {
  const { data: pendingResources } = usePendingResources();
  const { data: allResources } = useAllResources();

  const stats = {
    pending: pendingResources?.length || 0,
    approved: allResources?.filter(r => r.review_status === 'approved').length || 0,
    rejected: allResources?.filter(r => r.review_status === 'rejected').length || 0,
    total: allResources?.length || 0,
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of content review activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Resources awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Published resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Declined submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <FileStack className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {stats.pending > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Reviews
                <Badge variant="secondary" className="ml-2">{stats.pending}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You have {stats.pending} resource{stats.pending !== 1 ? 's' : ''} waiting for review.
              </p>
              <Button asChild>
                <Link to="/admin/pending">
                  Start Reviewing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allResources && allResources.length > 0 ? (
              <div className="space-y-4">
                {allResources.slice(0, 5).map((resource) => (
                  <div 
                    key={resource.id} 
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.provider?.name || 'Unknown provider'}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        resource.review_status === 'approved' ? 'default' :
                        resource.review_status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {resource.review_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No resources submitted yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
