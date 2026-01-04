import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useResource } from '@/hooks/useResources';
import { useUpdateResource } from '@/hooks/useUpdateResource';
import { useProviders } from '@/hooks/useProviders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  RESOURCE_TYPES, 
  RESOURCE_LEVELS, 
  RESOURCE_SEGMENTS, 
  RESOURCE_TOPICS
} from '@/lib/constants';
import { ResourceLevel, ResourceType } from '@/types/database';

export default function EditResource() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: resource, isLoading } = useResource(id || '');
  const { data: providers } = useProviders();
  const updateResource = useUpdateResource();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState<ResourceType>('guide');
  const [topics, setTopics] = useState<string[]>([]);
  const [levels, setLevels] = useState<ResourceLevel[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  // Populate form when resource loads
  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description);
      setExternalUrl(resource.external_url || '');
      setDurationMinutes(resource.duration_minutes || undefined);
      setLearningOutcomes(resource.learning_outcomes || []);
      setResourceType(resource.resource_type);
      setTopics(resource.topics);
      setLevels(resource.levels);
      setSegments(resource.segments || []);
      setProviderId(resource.provider_id);
      setIsFeatured(resource.is_featured);
    }
  }, [resource]);

  const toggleArrayValue = <T extends string>(
    array: T[], 
    value: T, 
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    if (!title.trim() || !description.trim() || topics.length === 0 || levels.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, description, topics, levels)",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateResource.mutateAsync({
        id,
        title,
        description,
        resource_type: resourceType,
        topics,
        levels,
        segments,
        external_url: externalUrl || undefined,
        duration_minutes: durationMinutes,
        learning_outcomes: learningOutcomes.filter(lo => lo.trim()),
        provider_id: providerId,
        is_featured: isFeatured,
      });

      toast({
        title: "Resource Updated",
        description: "The resource has been saved successfully.",
      });
      
      navigate('/admin/approved');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    }
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

  if (!resource) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p className="text-muted-foreground">Resource not found.</p>
          <Button variant="outline" onClick={() => navigate('/admin/approved')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approved Resources
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/approved')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold">Edit Resource</h1>
              <p className="text-sm text-muted-foreground">Update resource details</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateResource.isPending}>
            {updateResource.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resource title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the resource"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">External URL</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMinutes || ''}
                  onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label>Learning Outcomes</Label>
                <div className="space-y-2">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={outcome}
                        onChange={(e) => {
                          const updated = [...learningOutcomes];
                          updated[index] = e.target.value;
                          setLearningOutcomes(updated);
                        }}
                        placeholder={`Outcome ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLearningOutcomes([...learningOutcomes, ''])}
                  >
                    + Add Outcome
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured Resource
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Resource Type *</Label>
                <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Select 
                  value={providerId || 'none'} 
                  onValueChange={(v) => setProviderId(v === 'none' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No provider</SelectItem>
                    {providers?.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topics * (select at least one)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
                  {RESOURCE_TOPICS.map((topic) => (
                    <Badge
                      key={topic.value}
                      variant={topics.includes(topic.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayValue(topics, topic.value, setTopics)}
                    >
                      {topic.value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Levels * (select at least one)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
                  {RESOURCE_LEVELS.map((level) => (
                    <Badge
                      key={level.value}
                      variant={levels.includes(level.value as ResourceLevel) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayValue(levels, level.value as ResourceLevel, setLevels)}
                    >
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Segments</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 max-h-32 overflow-y-auto">
                  {RESOURCE_SEGMENTS.map((segment) => (
                    <Badge
                      key={segment}
                      variant={segments.includes(segment) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayValue(segments, segment, setSegments)}
                    >
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
