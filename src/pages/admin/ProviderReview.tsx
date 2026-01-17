import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProviders } from '@/hooks/useProviders';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SmartLogo } from '@/components/common/SmartLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  FileUp,
  Building2,
  Globe,
  Heart,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import type { Provider, ProviderType } from '@/types/database';

const providerColors: Record<ProviderType, string> = {
  government: 'bg-[hsl(210,70%,45%)] text-white',
  independent: 'bg-[hsl(168,55%,38%)] text-white',
  international: 'bg-[hsl(280,60%,50%)] text-white',
  community: 'bg-[hsl(35,85%,55%)] text-foreground',
};

const providerIcons: Record<ProviderType, React.ReactNode> = {
  government: <Building2 className="h-3 w-3" />,
  independent: <Heart className="h-3 w-3" />,
  international: <Globe className="h-3 w-3" />,
  community: <Users className="h-3 w-3" />,
};

export default function ProviderReview() {
  const { data: providers, isLoading } = useProviders();
  const queryClient = useQueryClient();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importCsv, setImportCsv] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('csv');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const pendingProviders = providers?.filter(p => !p.is_verified) || [];
  const approvedProviders = providers?.filter(p => p.is_verified) || [];

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImportJson(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImportCsv(reader.result as string);
    };
    reader.readAsText(file);
  };

  const parseCsvToProviders = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }
    
    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Required: name column
    const nameIdx = headers.findIndex(h => h === 'name');
    if (nameIdx === -1) {
      throw new Error('CSV must have a "name" column');
    }
    
    // Optional columns
    const typeIdx = headers.findIndex(h => h === 'type');
    const categoryIdx = headers.findIndex(h => h === 'category');
    const websiteIdx = headers.findIndex(h => h === 'website');
    const providerUrlIdx = headers.findIndex(h => h === 'providerurl' || h === 'provider_url' || h === 'provider url');
    const descriptionIdx = headers.findIndex(h => h === 'description');
    const targetAudienceIdx = headers.findIndex(h => h === 'targetaudience' || h === 'target_audience' || h === 'target audience');
    
    // Parse data rows
    const providers = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || !values[nameIdx]?.trim()) continue;
      
      providers.push({
        name: values[nameIdx]?.trim() || '',
        type: typeIdx >= 0 ? values[typeIdx]?.trim() : undefined,
        category: categoryIdx >= 0 ? values[categoryIdx]?.trim() : undefined,
        website: websiteIdx >= 0 ? values[websiteIdx]?.trim() : undefined,
        providerUrl: providerUrlIdx >= 0 ? values[providerUrlIdx]?.trim() : undefined,
        description: descriptionIdx >= 0 ? values[descriptionIdx]?.trim() : undefined,
        targetAudience: targetAudienceIdx >= 0 ? values[targetAudienceIdx]?.trim() : undefined,
      });
    }
    
    return providers;
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  };

  const handleImport = async () => {
    let parsedProviders;
    
    if (importFormat === 'csv') {
      if (!importCsv.trim()) {
        toast.error('Please paste or upload CSV data');
        return;
      }
      
      try {
        parsedProviders = parseCsvToProviders(importCsv);
        if (parsedProviders.length === 0) {
          throw new Error('No valid providers found in CSV');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid CSV format';
        toast.error(message);
        return;
      }
    } else {
      if (!importJson.trim()) {
        toast.error('Please paste or upload JSON data');
        return;
      }

      try {
        parsedProviders = JSON.parse(importJson);
        if (!Array.isArray(parsedProviders)) {
          throw new Error('JSON must be an array of providers');
        }
      } catch {
        toast.error('Invalid JSON format');
        return;
      }
    }

    setIsImporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in');
        return;
      }

      const response = await supabase.functions.invoke('import-providers', {
        body: { providers: parsedProviders }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsImportDialogOpen(false);
      setImportJson('');
      setImportCsv('');
      
      toast.success(
        `Import complete: ${result.imported.length} added for review, ${result.skipped.length} already exist`,
        { duration: 5000 }
      );
      
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors occurred during import`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleApprove = async (provider: Provider) => {
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('providers')
        .update({ is_verified: true })
        .eq('id', provider.id);

      if (error) throw error;
      
      toast.success(`${provider.name} approved`);
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsDetailOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve';
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProvider) return;
    
    try {
      // We keep the provider but mark as permanently rejected (not verified)
      // This prevents re-import in future iterations
      const { error } = await supabase
        .from('providers')
        .update({ 
          is_verified: false,
          description: `[REJECTED] ${selectedProvider.description || 'No description'}`
        })
        .eq('id', selectedProvider.id);

      if (error) throw error;
      
      toast.success(`${selectedProvider.name} marked as rejected`);
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject';
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDetailOpen(true);
  };

  const openRejectDialog = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsRejectDialogOpen(true);
  };

  const ProviderCard = ({ provider, showActions = true }: { provider: Provider; showActions?: boolean }) => {
    const isRejected = provider.description?.startsWith('[REJECTED]');
    
    return (
      <Card className={`transition-all hover:shadow-md ${isRejected ? 'opacity-60 border-destructive/30' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <SmartLogo
              src={provider.logo_url}
              alt={provider.name}
              className="h-10 w-10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-1">
                {provider.name}
                {provider.category && (
                  <span className="text-muted-foreground font-normal"> — {provider.category}</span>
                )}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`${providerColors[provider.provider_type]} text-xs`}
                >
                  {providerIcons[provider.provider_type]}
                  <span className="ml-1 capitalize">{provider.provider_type}</span>
                </Badge>
                {provider.category && (
                  <Badge variant="outline" className="text-xs">
                    {provider.category}
                  </Badge>
                )}
                {isRejected && (
                  <Badge variant="destructive" className="text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {isRejected 
              ? provider.description?.replace('[REJECTED] ', '') 
              : (provider.description || 'No description available')}
          </p>
          
          <div className="space-y-1 mb-3">
            {provider.provider_url && (
              <a 
                href={provider.provider_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                {(() => { try { return new URL(provider.provider_url).pathname || provider.provider_url; } catch { return provider.provider_url; } })()}
              </a>
            )}
            {provider.website_url && !provider.provider_url && (
              <a 
                href={provider.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                {(() => { try { return new URL(provider.website_url).hostname; } catch { return provider.website_url; } })()}
              </a>
            )}
          </div>

          {provider.target_audience && provider.target_audience.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {provider.target_audience.slice(0, 3).map((audience, i) => (
                <Badge key={i} variant="outline" className="text-xs">{audience}</Badge>
              ))}
              {provider.target_audience.length > 3 && (
                <Badge variant="outline" className="text-xs">+{provider.target_audience.length - 3}</Badge>
              )}
            </div>
          )}
          
          {showActions && !isRejected && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleViewDetails(provider)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Review
              </Button>
              <Button 
                size="sm" 
                variant="default"
                className="flex-1"
                onClick={() => handleApprove(provider)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => openRejectDialog(provider)}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Provider Review</h1>
            <p className="text-muted-foreground">
              Review and approve providers for the public directory
            </p>
          </div>
          <Button onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Providers
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingProviders.filter(p => !p.description?.startsWith('[REJECTED]')).length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedProviders.length}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingProviders.filter(p => p.description?.startsWith('[REJECTED]')).length}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending Review
              {pendingProviders.filter(p => !p.description?.startsWith('[REJECTED]')).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingProviders.filter(p => !p.description?.startsWith('[REJECTED]')).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingProviders.filter(p => !p.description?.startsWith('[REJECTED]')).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">No providers pending review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingProviders
                  .filter(p => !p.description?.startsWith('[REJECTED]'))
                  .map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))
                }
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : approvedProviders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No approved providers yet</h3>
                  <p className="text-muted-foreground">Approve providers from the pending tab</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvedProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingProviders.filter(p => p.description?.startsWith('[REJECTED]')).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No rejected providers</h3>
                  <p className="text-muted-foreground">Rejected providers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingProviders
                  .filter(p => p.description?.startsWith('[REJECTED]'))
                  .map(provider => (
                    <ProviderCard key={provider.id} provider={provider} showActions={false} />
                  ))
                }
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Providers for Review
              </DialogTitle>
              <DialogDescription>
                Import providers from CSV (Google Sheets) or JSON. New providers will be added 
                as "pending" for your review. Existing providers will be skipped.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={importFormat} onValueChange={(v) => setImportFormat(v as 'csv' | 'json')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV / Google Sheets
                </TabsTrigger>
                <TabsTrigger value="json" className="gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="csv" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleCsvFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => csvFileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload CSV File
                  </Button>
                </div>
                
                <div className="relative">
                  <Textarea
                    value={importCsv}
                    onChange={(e) => setImportCsv(e.target.value)}
                    placeholder={`Paste CSV here (Google Sheets: File → Download → CSV):

name,category,type,website,providerUrl,description,targetAudience
CCPC,Schools Education,government body,https://ccpc.ie,https://ccpc.ie/schools,Schools programme,"Primary, Secondary"
CCPC,Consumer Rights,government body,https://ccpc.ie,https://ccpc.ie/consumers,Consumer protection,Adults`}
                    className="min-h-[180px] font-mono text-sm"
                  />
                </div>
                
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">CSV Column Headers</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li><code className="bg-muted px-1 rounded">name</code> - Required (provider organization name)</li>
                      <li><code className="bg-muted px-1 rounded">category</code> - Sub-area (e.g., "Schools Education", "Consumer Rights")</li>
                      <li><code className="bg-muted px-1 rounded">type</code> - government body, independent/charity, etc.</li>
                      <li><code className="bg-muted px-1 rounded">website</code> - Main organization URL</li>
                      <li><code className="bg-muted px-1 rounded">providerUrl</code> - Specific page URL for this category</li>
                      <li><code className="bg-muted px-1 rounded">description</code> - Description of this category/area</li>
                      <li><code className="bg-muted px-1 rounded">targetAudience</code> - Comma-separated audiences</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="json" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleJsonFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload JSON File
                  </Button>
                </div>
                
                <div className="relative">
                  <Textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder={`Paste JSON array here, e.g.:
[
  {
    "name": "CCPC",
    "category": "Schools Education",
    "type": "government",
    "website": "https://ccpc.ie",
    "providerUrl": "https://ccpc.ie/schools",
    "description": "Schools education programme",
    "targetAudience": ["Primary", "Secondary"]
  }
]`}
                    className="min-h-[180px] font-mono text-sm"
                  />
                </div>
                
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Supported Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-3">
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li><code className="bg-muted px-1 rounded">name</code> - Required (provider organization name)</li>
                      <li><code className="bg-muted px-1 rounded">category</code> - Sub-area (e.g., "Schools Education")</li>
                      <li><code className="bg-muted px-1 rounded">type</code> - government, independent, community, international</li>
                      <li><code className="bg-muted px-1 rounded">website</code> - Main organization URL</li>
                      <li><code className="bg-muted px-1 rounded">providerUrl</code> - Specific page URL for this category</li>
                      <li><code className="bg-muted px-1 rounded">description</code> - Description of this category/area</li>
                      <li><code className="bg-muted px-1 rounded">targetAudience</code> - Array or comma-separated string</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || (importFormat === 'csv' ? !importCsv.trim() : !importJson.trim())}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import for Review
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Provider Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            {selectedProvider && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <SmartLogo
                      src={selectedProvider.logo_url}
                      alt={selectedProvider.name}
                      className="h-16 w-16"
                    />
                    <div>
                      <DialogTitle>
                        {selectedProvider.name}
                        {selectedProvider.category && (
                          <span className="text-muted-foreground font-normal text-base"> — {selectedProvider.category}</span>
                        )}
                      </DialogTitle>
                      <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={providerColors[selectedProvider.provider_type]}>
                          {providerIcons[selectedProvider.provider_type]}
                          <span className="ml-1 capitalize">{selectedProvider.provider_type}</span>
                        </Badge>
                        {selectedProvider.category && (
                          <Badge variant="secondary">{selectedProvider.category}</Badge>
                        )}
                        <span>•</span>
                        <span>{selectedProvider.country}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProvider.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedProvider.website_url && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Main Website</h4>
                        <a 
                          href={selectedProvider.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {(() => { try { return new URL(selectedProvider.website_url).hostname; } catch { return selectedProvider.website_url; } })()} 
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedProvider.provider_url && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Specific Page URL</h4>
                        <a 
                          href={selectedProvider.provider_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedProvider.provider_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedProvider.target_audience && selectedProvider.target_audience.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Target Audience</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedProvider.target_audience.map((audience, i) => (
                          <Badge key={i} variant="outline">{audience}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Similar Approved Providers</h4>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {approvedProviders
                          .filter(p => p.provider_type === selectedProvider.provider_type)
                          .slice(0, 5)
                          .map(p => (
                            <div key={p.id} className="flex items-center gap-2 text-sm">
                              <SmartLogo src={p.logo_url} alt={p.name} className="h-6 w-6" />
                              <span>{p.name}</span>
                            </div>
                          ))
                        }
                        {approvedProviders.filter(p => p.provider_type === selectedProvider.provider_type).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No similar providers approved yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsDetailOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedProvider)}
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Provider?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark "{selectedProvider?.name}" as rejected. The provider will be kept 
                in the database to prevent re-importing, but won't appear in the public directory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground">
                Reject Provider
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
