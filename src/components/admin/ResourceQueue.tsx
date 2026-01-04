import { Resource } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  FileText, 
  Building2, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RESOURCE_TYPES, RESOURCE_LEVELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ResourceQueueProps {
  resources: Resource[];
  selectedId?: string;
  onSelect: (resource: Resource) => void;
}

export function ResourceQueue({ resources, selectedId, onSelect }: ResourceQueueProps) {
  const getTypeLabel = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getLevelLabels = (levels: string[]) => {
    return levels.map(level => 
      RESOURCE_LEVELS.find(l => l.value === level)?.label || level
    );
  };

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No resources to review</h3>
        <p className="text-muted-foreground text-sm">
          All pending resources have been reviewed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <Card 
          key={resource.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedId === resource.id && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(resource)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {resource.review_status === 'needs_changes' && (
                    <Badge variant="outline" className="text-warning border-warning">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Needs Changes
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {getTypeLabel(resource.resource_type)}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-foreground truncate">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {resource.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {resource.provider && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {resource.provider.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {getLevelLabels(resource.levels).slice(0, 3).map((level) => (
                    <Badge key={level} variant="outline" className="text-xs">
                      {level}
                    </Badge>
                  ))}
                  {resource.levels.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.levels.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
