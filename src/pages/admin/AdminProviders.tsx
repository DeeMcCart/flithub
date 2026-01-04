import { useState, useRef } from 'react';
import { SmartLogo } from '@/components/common/SmartLogo';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProviders } from '@/hooks/useProviders';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle,
  Building2,
  Globe,
  Heart,
  Users,
  Upload,
  X,
  FileUp,
  ImageIcon
} from 'lucide-react';
import type { Provider, ProviderType } from '@/types/database';

const providerTypes: { value: ProviderType; label: string }[] = [
  { value: 'government', label: 'Government' },
  { value: 'independent', label: 'Independent' },
  { value: 'community', label: 'Community' },
  { value: 'international', label: 'International' },
];

const providerColors: Record<ProviderType, string> = {
  government: 'bg-[hsl(210,70%,45%)] text-white',
  independent: 'bg-[hsl(168,55%,38%)] text-white',
  international: 'bg-[hsl(280,60%,50%)] text-white',
  community: 'bg-[hsl(35,85%,55%)] text-foreground',
};

const providerIcons: Record<ProviderType, React.ReactNode> = {
  government: <Building2 className="h-4 w-4" />,
  independent: <Heart className="h-4 w-4" />,
  international: <Globe className="h-4 w-4" />,
  community: <Users className="h-4 w-4" />,
};

interface FormData extends Partial<Provider> {
  logoFile?: File | null;
  logoPreview?: string | null;
}

const emptyProvider: FormData = {
  name: '',
  description: '',
  provider_type: 'independent',
  country: 'Ireland',
  website_url: '',
  logo_url: '',
  is_verified: false,
  target_audience: [],
  logoFile: null,
  logoPreview: null,
};

export default function AdminProviders() {
  const { data: providers, isLoading } = useProviders();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyProvider);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isFetchingLogos, setIsFetchingLogos] = useState(false);
  const [fetchingLogoId, setFetchingLogoId] = useState<string | null>(null);
  const [isFetchDialogOpen, setIsFetchDialogOpen] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({
    current: 0,
    total: 0,
    currentProvider: '',
    results: [] as { name: string; status: 'success' | 'failed' | 'skipped'; error?: string }[]
  });
  const [importJson, setImportJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setSelectedProvider(null);
    setFormData(emptyProvider);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      description: provider.description || '',
      provider_type: provider.provider_type,
      country: provider.country,
      website_url: provider.website_url || '',
      logo_url: provider.logo_url || '',
      is_verified: provider.is_verified || false,
      target_audience: provider.target_audience || [],
      logoFile: null,
      logoPreview: provider.logo_url || null,
    });
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        logoFile: file,
        logoPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData({
      ...formData,
      logoFile: null,
      logoPreview: null,
      logo_url: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogo = async (file: File, providerId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('provider-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('provider-logos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleOpenDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Provider name is required');
      return;
    }

    setIsSaving(true);
    try {
      let logoUrl = formData.logo_url || null;

      if (selectedProvider) {
        // Update existing provider
        // If there's a new logo file, upload it
        if (formData.logoFile) {
          setIsUploading(true);
          logoUrl = await uploadLogo(formData.logoFile, selectedProvider.id);
          setIsUploading(false);
        } else if (!formData.logoPreview && selectedProvider.logo_url) {
          // Logo was removed
          logoUrl = null;
        }

        const { error } = await supabase
          .from('providers')
          .update({
            name: formData.name,
            description: formData.description,
            provider_type: formData.provider_type,
            country: formData.country,
            website_url: formData.website_url,
            logo_url: logoUrl,
            is_verified: formData.is_verified,
            target_audience: formData.target_audience,
          })
          .eq('id', selectedProvider.id);

        if (error) throw error;
        toast.success('Provider updated successfully');
      } else {
        // Create new provider first to get the ID
        const { data: newProvider, error: createError } = await supabase
          .from('providers')
          .insert({
            name: formData.name,
            description: formData.description,
            provider_type: formData.provider_type as ProviderType,
            country: formData.country || 'Ireland',
            website_url: formData.website_url,
            is_verified: formData.is_verified,
            target_audience: formData.target_audience,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Upload logo if provided
        if (formData.logoFile && newProvider) {
          setIsUploading(true);
          logoUrl = await uploadLogo(formData.logoFile, newProvider.id);
          setIsUploading(false);

          // Update provider with logo URL
          const { error: updateError } = await supabase
            .from('providers')
            .update({ logo_url: logoUrl })
            .eq('id', newProvider.id);

          if (updateError) throw updateError;
        }

        toast.success('Provider created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save provider');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProvider) return;

    try {
      // Delete logo from storage if exists
      if (selectedProvider.logo_url) {
        const fileName = selectedProvider.logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('provider-logos').remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', selectedProvider.id);

      if (error) throw error;
      toast.success('Provider deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete provider';
      toast.error(errorMessage);
    }
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImportJson(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error('Please paste or upload JSON data');
      return;
    }

    let parsedProviders;
    try {
      parsedProviders = JSON.parse(importJson);
      if (!Array.isArray(parsedProviders)) {
        throw new Error('JSON must be an array of providers');
      }
    } catch {
      toast.error('Invalid JSON format');
      return;
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
      
      toast.success(
        `Import complete: ${result.imported.length} imported, ${result.skipped.length} skipped`,
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

  const handleFetchAllLogos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('You must be logged in');
      return;
    }

    // Get providers without logos
    const providersToFetch = providers?.filter(p => !p.logo_url && p.website_url) || [];
    
    if (providersToFetch.length === 0) {
      toast.info('All providers already have logos or no website URLs');
      return;
    }

    setFetchProgress({
      current: 0,
      total: providersToFetch.length,
      currentProvider: '',
      results: []
    });
    setIsFetchDialogOpen(true);
    setIsFetchingLogos(true);

    const results: typeof fetchProgress.results = [];

    for (let i = 0; i < providersToFetch.length; i++) {
      const provider = providersToFetch[i];
      
      setFetchProgress(prev => ({
        ...prev,
        current: i + 1,
        currentProvider: provider.name
      }));

      try {
        const response = await supabase.functions.invoke('fetch-provider-logos', {
          body: { providerId: provider.id }
        });

        if (response.error) {
          results.push({ name: provider.name, status: 'failed', error: response.error.message });
        } else {
          const result = response.data;
          if (result.results?.[0]?.status === 'success') {
            results.push({ name: provider.name, status: 'success' });
          } else {
            results.push({ 
              name: provider.name, 
              status: 'failed', 
              error: result.results?.[0]?.error || 'Unknown error' 
            });
          }
        }
      } catch (error) {
        results.push({ 
          name: provider.name, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }

      setFetchProgress(prev => ({
        ...prev,
        results: [...results]
      }));
    }

    queryClient.invalidateQueries({ queryKey: ['providers'] });
    setIsFetchingLogos(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    toast.success(
      `Logo fetch complete: ${successCount} successful, ${failedCount} failed`,
      { duration: 5000 }
    );
  };

  const handleFetchSingleLogo = async (providerId: string, providerName: string) => {
    setFetchingLogoId(providerId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in');
        return;
      }

      const response = await supabase.functions.invoke('fetch-provider-logos', {
        body: { providerId }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      queryClient.invalidateQueries({ queryKey: ['providers'] });

      if (result.results?.[0]?.status === 'success') {
        toast.success(`Logo fetched for ${providerName}`);
      } else {
        toast.error(result.results?.[0]?.error || 'Failed to fetch logo');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch logo';
      toast.error(errorMessage);
    } finally {
      setFetchingLogoId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Providers</h1>
            <p className="text-muted-foreground">
              Manage trusted resource providers
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleFetchAllLogos}
              disabled={isFetchingLogos}
            >
              {isFetchingLogos ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-2" />
              )}
              {isFetchingLogos ? 'Fetching...' : 'Fetch All Logos'}
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow 
                    key={provider.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenEdit(provider)}
                  >
                    <TableCell>
                      <SmartLogo
                        src={provider.logo_url}
                        alt={`${provider.name} logo`}
                        className="h-10 w-10"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {provider.name}
                        {provider.is_verified && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={providerColors[provider.provider_type]}>
                        <span className="flex items-center gap-1">
                          {providerIcons[provider.provider_type]}
                          {provider.provider_type.charAt(0).toUpperCase() + provider.provider_type.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{provider.country}</TableCell>
                    <TableCell>
                      {provider.is_verified ? (
                        <Badge variant="outline" className="text-success border-success">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Fetch logo from website"
                          disabled={fetchingLogoId === provider.id || !provider.website_url}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFetchSingleLogo(provider.id, provider.name);
                          }}
                        >
                          {fetchingLogoId === provider.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(provider);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(provider);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No providers found. Add your first provider to get started.
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedProvider ? 'Edit Provider' : 'Add Provider'}
              </DialogTitle>
              <DialogDescription>
                {selectedProvider
                  ? 'Update the provider details below.'
                  : 'Fill in the details to create a new provider.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Provider name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the provider"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_type">Type *</Label>
                  <Select
                    value={formData.provider_type}
                    onValueChange={(value) => setFormData({ ...formData, provider_type: value as ProviderType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ireland"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {formData.logoPreview ? (
                    <div className="relative">
                      <img 
                        src={formData.logoPreview} 
                        alt="Logo preview" 
                        className="h-16 w-16 rounded object-contain bg-white border border-gray-200 shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded bg-muted border border-dashed flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_verified">Verified</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark this provider as verified and trusted
                  </p>
                </div>
                <Switch
                  id="is_verified"
                  checked={formData.is_verified || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isUploading}>
                {(isSaving || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUploading ? 'Uploading...' : selectedProvider ? 'Save Changes' : 'Create Provider'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Provider</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedProvider?.name}"? 
                This action cannot be undone and may affect resources linked to this provider.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Providers</DialogTitle>
              <DialogDescription>
                Paste JSON array of providers or upload a JSON file. New providers will be created with verified=false.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Upload JSON File</Label>
                <div className="flex gap-2">
                  <Input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json,.txt"
                    onChange={handleJsonFileSelect}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Or Paste JSON</Label>
                <Textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='[{"name": "Provider Name", "type": "Government Body", "website": "https://...", "description": "...", "targetAudience": ["Adults", "Students"]}]'
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Expected JSON format:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>name</code> (required): Provider name</li>
                  <li><code>type</code>: e.g., "Government Body", "Charity", "International"</li>
                  <li><code>website</code>: URL to provider's website</li>
                  <li><code>description</code>: Brief description</li>
                  <li><code>targetAudience</code>: Array of audience segments</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !importJson.trim()}>
                {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isImporting ? 'Importing...' : 'Import Providers'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fetch Logos Progress Dialog */}
        <Dialog open={isFetchDialogOpen} onOpenChange={(open) => !isFetchingLogos && setIsFetchDialogOpen(open)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Fetching Provider Logos</DialogTitle>
              <DialogDescription>
                {isFetchingLogos 
                  ? `Processing ${fetchProgress.current} of ${fetchProgress.total} providers...`
                  : `Completed: ${fetchProgress.results.filter(r => r.status === 'success').length} successful, ${fetchProgress.results.filter(r => r.status === 'failed').length} failed`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{fetchProgress.current} / {fetchProgress.total}</span>
                </div>
                <Progress value={(fetchProgress.current / Math.max(fetchProgress.total, 1)) * 100} />
              </div>

              {isFetchingLogos && fetchProgress.currentProvider && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching: {fetchProgress.currentProvider}</span>
                </div>
              )}

              {fetchProgress.results.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Results</Label>
                  <ScrollArea className="h-48 rounded border p-2">
                    <div className="space-y-1">
                      {fetchProgress.results.map((result, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-2 text-sm py-1 ${
                            result.status === 'success' 
                              ? 'text-success' 
                              : 'text-destructive'
                          }`}
                        >
                          {result.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <X className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="truncate">{result.name}</span>
                          {result.error && (
                            <span className="text-xs text-muted-foreground truncate">
                              ({result.error})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={() => setIsFetchDialogOpen(false)} 
                disabled={isFetchingLogos}
              >
                {isFetchingLogos ? 'Processing...' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
