import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import type { Resource } from '@/types/database';
import { RESOURCE_LEVELS, RESOURCE_TYPES } from '@/lib/constants';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const levelLabel = RESOURCE_LEVELS.find(l => resource.levels.includes(l.value))?.label || resource.levels[0];
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
    <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              {levelLabel}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {typeInfo?.label || resource.resource_type}
            </Badge>
          </div>
          {resource.is_featured && (
            <Badge className="bg-accent text-accent-foreground text-xs">
              Featured
            </Badge>
          )}
        </div>
        <Link to={`/resources/${resource.id}`}>
          <h3 className="font-display font-semibold text-lg leading-tight mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {resource.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs bg-muted/50">
              {topic}
            </Badge>
          ))}
          {resource.topics.length > 3 && (
            <Badge variant="outline" className="text-xs bg-muted/50">
              +{resource.topics.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {resource.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {resource.duration_minutes} min
            </span>
          )}
          {resource.provider && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getProviderBadgeClass(resource.provider.provider_type)}`}>
              {resource.provider.is_verified && <CheckCircle className="h-3 w-3" />}
              {resource.provider.name.length > 15 
                ? resource.provider.name.substring(0, 15) + '...' 
                : resource.provider.name
              }
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span>4.5</span>
          </div>
          {resource.external_url && (
            <Button 
              size="sm" 
              variant="default"
              className="h-7 text-xs gap-1"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a 
                href={resource.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Access
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
