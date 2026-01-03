import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useResource } from '@/hooks/useResources';
import { useResourceRatings, useAverageRating } from '@/hooks/useRatings';
import { StarRating } from '@/components/common/StarRating';
import { ExternalLinkWarning } from '@/components/common/ExternalLinkWarning';
import { RESOURCE_LEVELS, RESOURCE_TYPES } from '@/lib/constants';
import {
  Clock,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Target,
  GraduationCap,
  Calendar,
  Building2,
  Loader2,
} from 'lucide-react';

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: resource, isLoading, error } = useResource(id || '');
  const { average, count } = useAverageRating(id || '');
  const { data: ratings } = useResourceRatings(id || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !resource) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The resource you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/resources">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const levelLabels = resource.levels
    .map(l => RESOURCE_LEVELS.find(level => level.value === l)?.label)
    .filter(Boolean);
  const typeInfo = RESOURCE_TYPES.find(t => t.value === resource.resource_type);

  const getProviderBadgeClass = (type?: string) => {
    switch (type) {
      case 'government': return 'badge-government';
      case 'independent': return 'badge-independent';
      case 'international': return 'badge-international';
      case 'community': return 'badge-community';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/resources" 
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr,350px] gap-8">
          {/* Main Content */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {resource.is_featured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
                <Badge variant="outline">{typeInfo?.label}</Badge>
                {levelLabels.map(label => (
                  <Badge key={label} variant="secondary">{label}</Badge>
                ))}
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {resource.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <StarRating rating={average} size="sm" />
                  <span>({count} review{count !== 1 ? 's' : ''})</span>
                </div>
                {resource.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {resource.duration_minutes} minutes
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {new Date(resource.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </CardContent>
            </Card>

            {/* Learning Outcomes */}
            {resource.learning_outcomes && resource.learning_outcomes.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.learning_outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Curriculum Tags */}
            {resource.curriculum_tags && resource.curriculum_tags.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Curriculum Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resource.curriculum_tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings && ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={rating.stars} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-muted-foreground">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to rate this resource!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Access Resource Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {resource.external_url && (
                  <ExternalLinkWarning 
                    href={resource.external_url}
                    className="w-full"
                  >
                    <Button className="w-full gap-2" size="lg">
                      <ExternalLink className="h-5 w-5" />
                      Access Resource
                    </Button>
                  </ExternalLinkWarning>
                )}

                <Separator className="my-4" />

                {/* Provider Info */}
                {resource.provider && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Provider</h4>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProviderBadgeClass(resource.provider.provider_type)}`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">
                            {resource.provider.name}
                          </span>
                          {resource.provider.is_verified && (
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {resource.provider.provider_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Topics */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.topics.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                {resource.segments && resource.segments.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-sm mb-3">Target Audience</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resource.segments.map(segment => (
                          <Badge key={segment} variant="secondary" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Review Status */}
                <div className="text-center text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-success" />
                  Quality Reviewed
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
