import { useState } from 'react';
import { Resource } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Star,
  BookOpen,
  Target,
  Users,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { REVIEW_CRITERIA, RESOURCE_TYPES, RESOURCE_LEVELS } from '@/lib/constants';
import { useUpdateResourceReview } from '@/hooks/useAdminResources';
import { toast } from 'sonner';

interface ReviewPanelProps {
  resource: Resource;
  onComplete: () => void;
}

export function ReviewPanel({ resource, onComplete }: ReviewPanelProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [reviewNotes, setReviewNotes] = useState(resource.review_notes || '');
  const [isFeatured, setIsFeatured] = useState(resource.is_featured);
  
  const updateReview = useUpdateResourceReview();

  const allChecked = REVIEW_CRITERIA.every(c => checklist[c.key]);
  const someChecked = REVIEW_CRITERIA.some(c => checklist[c.key]);

  const handleApprove = async () => {
    try {
      await updateReview.mutateAsync({
        resourceId: resource.id,
        status: 'approved',
        reviewNotes,
        isFeatured,
      });
      toast.success('Resource approved successfully');
      onComplete();
    } catch (error) {
      toast.error('Failed to approve resource');
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide feedback notes for rejection');
      return;
    }
    try {
      await updateReview.mutateAsync({
        resourceId: resource.id,
        status: 'rejected',
        reviewNotes,
      });
      toast.success('Resource rejected');
      onComplete();
    } catch (error) {
      toast.error('Failed to reject resource');
    }
  };

  const handleRequestChanges = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide feedback notes for requested changes');
      return;
    }
    try {
      await updateReview.mutateAsync({
        resourceId: resource.id,
        status: 'needs_changes',
        reviewNotes,
      });
      toast.success('Changes requested');
      onComplete();
    } catch (error) {
      toast.error('Failed to request changes');
    }
  };

  const getTypeLabel = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getLevelLabel = (level: string) => {
    return RESOURCE_LEVELS.find(l => l.value === level)?.label || level;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Resource Header */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="font-display text-2xl font-bold">{resource.title}</h2>
            {resource.external_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Resource
                </a>
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{getTypeLabel(resource.resource_type)}</Badge>
            {resource.provider && (
              <Badge variant="outline">
                <Building2 className="h-3 w-3 mr-1" />
                {resource.provider.name}
              </Badge>
            )}
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Submitted {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        {resource.learning_outcomes && resource.learning_outcomes.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <ul className="list-disc list-inside space-y-1">
                {resource.learning_outcomes.map((outcome, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{outcome}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-1">
                {resource.levels.map((level) => (
                  <Badge key={level} variant="secondary" className="text-xs">
                    {getLevelLabel(level)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-1">
                {resource.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {resource.duration_minutes && (
          <p className="text-sm text-muted-foreground">
            Duration: {resource.duration_minutes} minutes
          </p>
        )}

        <Separator />

        {/* Review Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {REVIEW_CRITERIA.map((criterion) => (
              <div key={criterion.key} className="flex items-start gap-3">
                <Checkbox
                  id={criterion.key}
                  checked={checklist[criterion.key] || false}
                  onCheckedChange={(checked) => 
                    setChecklist(prev => ({ ...prev, [criterion.key]: checked as boolean }))
                  }
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor={criterion.key} className="font-medium">
                    {criterion.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {criterion.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Featured Toggle */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <Label htmlFor="featured" className="font-medium">
                  Feature this resource
                </Label>
              </div>
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Featured resources appear prominently on the homepage
            </p>
          </CardContent>
        </Card>

        {/* Review Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Review Notes / Feedback</Label>
          <Textarea
            id="notes"
            placeholder="Add notes for the submitter (required for rejection or changes)..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleApprove}
            disabled={!allChecked || updateReview.isPending}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Resource
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleRequestChanges}
              disabled={updateReview.isPending}
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={updateReview.isPending}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>

          {!allChecked && someChecked && (
            <p className="text-xs text-muted-foreground text-center">
              Complete all checklist items to approve
            </p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
