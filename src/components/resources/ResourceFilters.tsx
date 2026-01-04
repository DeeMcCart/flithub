import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, X, Filter } from 'lucide-react';
import { RESOURCE_LEVELS, RESOURCE_TOPICS, RESOURCE_SEGMENTS, RESOURCE_TYPES } from '@/lib/constants';
import type { ResourceFilters, ResourceLevel, ResourceType } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResourceFiltersProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
}

export function ResourceFiltersPanel({ filters, onFiltersChange }: ResourceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  const activeFilterCount = 
    (filters.levels?.length || 0) +
    (filters.topics?.length || 0) +
    (filters.segments?.length || 0) +
    (filters.types?.length || 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Type Filter - MOVED TO TOP */}
      <div>
        <h4 className="font-medium mb-3 text-sm">Resource Type</h4>
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
      </div>

      {/* Level Filter */}
      <div>
        <h4 className="font-medium mb-3 text-sm">Education Level</h4>
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
      </div>

      {/* Topic Filter */}
      <div>
        <h4 className="font-medium mb-3 text-sm">Topics</h4>
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
      </div>

      {/* Segment Filter */}
      <div>
        <h4 className="font-medium mb-3 text-sm">Target Audience</h4>
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
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
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
          {filters.levels?.map(level => (
            <Badge key={level} variant="secondary" className="gap-1">
              {RESOURCE_LEVELS.find(l => l.value === level)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleLevel(level)}
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
          {filters.segments?.map(segment => (
            <Badge key={segment} variant="secondary" className="gap-1">
              {segment}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleSegment(segment)}
              />
            </Badge>
          ))}
          {filters.types?.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {RESOURCE_TYPES.find(t => t.value === type)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleType(type)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
