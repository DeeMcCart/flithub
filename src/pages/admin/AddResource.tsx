import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCreateResource } from '@/hooks/useCreateResource';
import { useProviders } from '@/hooks/useProviders';
import { RESOURCE_LEVELS, RESOURCE_TYPES, RESOURCE_TOPICS, RESOURCE_SEGMENTS } from '@/lib/constants';
import { ArrowLeft, ArrowRight, Save, Plus, X, CheckCircle } from 'lucide-react';

const resourceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  external_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  resource_type: z.enum(['lesson_plan', 'slides', 'worksheet', 'project_brief', 'video', 'quiz', 'guide', 'interactive']),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  levels: z.array(z.enum(['primary', 'junior_cycle', 'transition_year', 'senior_cycle', 'lca', 'adult_community'])).min(1, 'Select at least one level'),
  segments: z.array(z.string()).optional(),
  duration_minutes: z.number().min(1).max(500).optional(),
  learning_outcomes: z.array(z.string()).optional(),
  provider_id: z.string().optional(),
  is_featured: z.boolean().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

const STEPS = ['Basic Info', 'Classification', 'Details', 'Review'];

export default function AddResource() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [newOutcome, setNewOutcome] = useState('');
  
  const { mutate: createResource, isPending } = useCreateResource();
  const { data: providers } = useProviders();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      external_url: '',
      resource_type: 'lesson_plan',
      topics: [],
      levels: [],
      segments: [],
      learning_outcomes: [],
      is_featured: false,
    },
  });

  const watchedValues = form.watch();

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof ResourceFormData)[] => {
    switch (step) {
      case 0:
        return ['title', 'description', 'external_url'];
      case 1:
        return ['resource_type', 'topics', 'levels', 'segments'];
      case 2:
        return ['duration_minutes', 'learning_outcomes', 'provider_id', 'is_featured'];
      default:
        return [];
    }
  };

  const addLearningOutcome = () => {
    if (newOutcome.trim()) {
      const current = form.getValues('learning_outcomes') || [];
      form.setValue('learning_outcomes', [...current, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const removeLearningOutcome = (index: number) => {
    const current = form.getValues('learning_outcomes') || [];
    form.setValue('learning_outcomes', current.filter((_, i) => i !== index));
  };

  const toggleArrayValue = (field: 'topics' | 'levels' | 'segments', value: string) => {
    const current = form.getValues(field) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    form.setValue(field, updated, { shouldValidate: true });
  };

  const onSubmit = (data: ResourceFormData) => {
    createResource(
      {
        title: data.title,
        description: data.description,
        external_url: data.external_url || undefined,
        resource_type: data.resource_type,
        topics: data.topics,
        levels: data.levels,
        segments: data.segments,
        duration_minutes: data.duration_minutes,
        learning_outcomes: data.learning_outcomes,
        provider_id: data.provider_id,
        is_featured: data.is_featured,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Resource Created',
            description: 'The resource has been added and published successfully.',
          });
          navigate('/admin');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create resource',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="font-display text-3xl font-bold">Add New Resource</h1>
          <p className="text-muted-foreground">
            Add a new financial literacy resource to the collection
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the core details about this resource</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Introduction to Budgeting for Teens" {...field} />
                        </FormControl>
                        <FormDescription>A clear, descriptive title for the resource</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this resource covers, who it's for, and what learners will gain..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>A comprehensive description of the resource content</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="external_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/resource" {...field} />
                        </FormControl>
                        <FormDescription>Link to the external resource (if applicable)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Classification */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Classification</CardTitle>
                  <CardDescription>Categorize the resource for easy discovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="resource_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RESOURCE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="topics"
                    render={() => (
                      <FormItem>
                        <FormLabel>Topics * (select at least one)</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {RESOURCE_TOPICS.map((topic) => (
                            <Badge
                              key={topic.value}
                              variant={watchedValues.topics?.includes(topic.value) ? 'default' : 'outline'}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArrayValue('topics', topic.value)}
                            >
                              {topic.value}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="levels"
                    render={() => (
                      <FormItem>
                        <FormLabel>Education Levels * (select at least one)</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {RESOURCE_LEVELS.map((level) => (
                            <Badge
                              key={level.value}
                              variant={watchedValues.levels?.includes(level.value as any) ? 'default' : 'outline'}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArrayValue('levels', level.value)}
                            >
                              {level.label}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segments"
                    render={() => (
                      <FormItem>
                        <FormLabel>Target Segments (optional)</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {RESOURCE_SEGMENTS.map((segment) => (
                            <Badge
                              key={segment}
                              variant={watchedValues.segments?.includes(segment) ? 'default' : 'outline'}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArrayValue('segments', segment)}
                            >
                              {segment}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>Optional information to enhance the resource listing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 45"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Estimated time to complete the resource</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>Learning Outcomes</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add a learning outcome..."
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningOutcome())}
                      />
                      <Button type="button" variant="secondary" onClick={addLearningOutcome}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {watchedValues.learning_outcomes && watchedValues.learning_outcomes.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {watchedValues.learning_outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                            <span className="flex-1">{outcome}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLearningOutcome(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


                  <FormField
                    control={form.control}
                    name="provider_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers?.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The organization that created this resource</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Feature this resource</FormLabel>
                          <FormDescription>
                            Featured resources appear prominently on the homepage
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>Review the resource details before publishing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Title</span>
                      <span className="col-span-2">{watchedValues.title}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Description</span>
                      <span className="col-span-2 text-sm">{watchedValues.description}</span>
                    </div>
                    {watchedValues.external_url && (
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <span className="font-medium text-muted-foreground">External URL</span>
                        <span className="col-span-2 text-sm text-primary truncate">{watchedValues.external_url}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Type</span>
                      <span className="col-span-2">
                        {RESOURCE_TYPES.find((t) => t.value === watchedValues.resource_type)?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Topics</span>
                      <div className="col-span-2 flex flex-wrap gap-1">
                        {watchedValues.topics?.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-medium text-muted-foreground">Levels</span>
                      <div className="col-span-2 flex flex-wrap gap-1">
                        {watchedValues.levels?.map((level) => (
                          <Badge key={level} variant="secondary" className="text-xs">
                            {RESOURCE_LEVELS.find((l) => l.value === level)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {watchedValues.segments && watchedValues.segments.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <span className="font-medium text-muted-foreground">Segments</span>
                        <div className="col-span-2 flex flex-wrap gap-1">
                          {watchedValues.segments.map((segment) => (
                            <Badge key={segment} variant="outline" className="text-xs">
                              {segment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {watchedValues.duration_minutes && (
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <span className="font-medium text-muted-foreground">Duration</span>
                        <span className="col-span-2">{watchedValues.duration_minutes} minutes</span>
                      </div>
                    )}
                    {watchedValues.learning_outcomes && watchedValues.learning_outcomes.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <span className="font-medium text-muted-foreground">Learning Outcomes</span>
                        <ul className="col-span-2 list-disc list-inside text-sm">
                          {watchedValues.learning_outcomes.map((outcome, i) => (
                            <li key={i}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {watchedValues.provider_id && (
                      <div className="grid grid-cols-3 gap-4 py-2 border-b">
                        <span className="font-medium text-muted-foreground">Provider</span>
                        <span className="col-span-2">
                          {providers?.find((p) => p.id === watchedValues.provider_id)?.name}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <span className="font-medium text-muted-foreground">Featured</span>
                      <span className="col-span-2">{watchedValues.is_featured ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? 'Creating...' : 'Create Resource'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
