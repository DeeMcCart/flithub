import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { RESOURCE_LEVELS, RESOURCE_TOPICS, RESOURCE_SEGMENTS, RESOURCE_TYPES } from '@/lib/constants';
import type { ResourceFilters, ResourceLevel, ResourceType } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useProviders } from '@/hooks/useProviders';

interface ResourceFiltersProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
}

export function ResourceFiltersPanel({ filters, onFiltersChange }: ResourceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: providers } = useProviders();
  
  // Track which sections are open - Resource Type and Topics open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    resourceType: true,
    topics: true,
    providers: false,
    levels: false,
    segments: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleLevel = (level: ResourceLevel) => {
    const current = filters.levels || [];
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level];
    onFiltersChange({ ...filters, levels: updated });
  };

  const toggleTopic = (topic: string) => {
    const current = filters.topics || [];
    const updated = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    onFiltersChange({ ...filters, topics: updated });
  };

  const toggleSegment = (segment: string) => {
    const current = filters.segments || [];
    const updated = current.includes(segment)
      ? current.filter(s => s !== segment)
      : [...current, segment];
    onFiltersChange({ ...filters, segments: updated });
  };

  const toggleType = (type: ResourceType) => {
    const current = filters.types || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, types: updated });
  };

  const setProvider = (providerId: string | undefined) => {
    onFiltersChange({ ...filters, providerId });
  };

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  const activeFilterCount = 
    (filters.levels?.length || 0) +
    (filters.topics?.length || 0) +
    (filters.segments?.length || 0) +
    (filters.types?.length || 0) +
    (filters.providerId ? 1 : 0);

  const FilterSection = ({ 
    id, 
    title, 
    count, 
    children 
  }: { 
    id: string; 
    title: string; 
    count?: number; 
    children: React.ReactNode;
  }) => (
    <Collapsible open={openSections[id]} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{title}</h4>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          openSections[id] && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  const FilterContent = () => (
    <div className="space-y-2">
      {/* Resource Type - First, expanded by default */}
      <FilterSection id="resourceType" title="Resource Type" count={filters.types?.length}>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map(type => (
            <Badge
              key={type.value}
              variant={filters.types?.includes(type.value) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleType(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </FilterSection>

      {/* Topics - Second, expanded by default */}
      <FilterSection id="topics" title="Topics" count={filters.topics?.length}>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TOPICS.map(topic => (
            <Badge
              key={topic.value}
              variant={filters.topics?.includes(topic.value) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleTopic(topic.value)}
            >
              {topic.value}
            </Badge>
          ))}
        </div>
      </FilterSection>

      {/* Providers - Third, collapsed by default */}
      <FilterSection id="providers" title="Provider" count={filters.providerId ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {filters.providerId && (
            <Badge
              variant="default"
              className="cursor-pointer hover:bg-primary/90 transition-colors gap-1"
              onClick={() => setProvider(undefined)}
            >
              {providers?.find(p => p.id === filters.providerId)?.name || 'Selected'}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {providers?.filter(p => p.id !== filters.providerId).map(provider => (
            <Badge
              key={provider.id}
              variant="outline"
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setProvider(provider.id)}
            >
              {provider.name}
            </Badge>
          ))}
        </div>
      </FilterSection>

      {/* Education Level - Fourth, collapsed by default */}
      <FilterSection id="levels" title="Education Level" count={filters.levels?.length}>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_LEVELS.map(level => (
            <Badge
              key={level.value}
              variant={filters.levels?.includes(level.value) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleLevel(level.value)}
            >
              {level.label}
            </Badge>
          ))}
        </div>
      </FilterSection>

      {/* Target Audience - Fifth, collapsed by default */}
      <FilterSection id="segments" title="Target Audience" count={filters.segments?.length}>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_SEGMENTS.map(segment => (
            <Badge
              key={segment}
              variant={filters.segments?.includes(segment) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleSegment(segment)}
            >
              {segment}
            </Badge>
          ))}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full mt-4">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filter Resources</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <FilterContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-card rounded-xl p-6 border">
        <FilterContent />
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.types?.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {RESOURCE_TYPES.find(t => t.value === type)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleType(type)}
              />
            </Badge>
          ))}
          {filters.topics?.map(topic => (
            <Badge key={topic} variant="secondary" className="gap-1">
              {topic}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleTopic(topic)}
              />
            </Badge>
          ))}
          {filters.levels?.map(level => (
            <Badge key={level} variant="secondary" className="gap-1">
              {RESOURCE_LEVELS.find(l => l.value === level)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleLevel(level)}
              />
            </Badge>
          ))}
          {filters.segments?.map(segment => (
            <Badge key={segment} variant="secondary" className="gap-1">
              {segment}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleSegment(segment)}
              />
            </Badge>
          ))}
          {filters.providerId && (
            <Badge variant="secondary" className="gap-1">
              {providers?.find(p => p.id === filters.providerId)?.name || 'Provider'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setProvider(undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
