import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProviders } from '@/hooks/useProviders';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  Users
} from 'lucide-react';
import type { Provider, ProviderType } from '@/types/database';

const providerTypes: { value: ProviderType; label: string }[] = [
  { value: 'government', label: 'Government' },
  { value: 'independent', label: 'Independent' },
  { value: 'community', label: 'Community' },
  { value: 'international', label: 'International' },
];

const providerColors: Record<ProviderType, string> = {
  government: 'badge-government',
  independent: 'badge-independent',
  international: 'badge-international',
  community: 'badge-community',
};

const providerIcons: Record<ProviderType, React.ReactNode> = {
  government: <Building2 className="h-4 w-4" />,
  independent: <Heart className="h-4 w-4" />,
  international: <Globe className="h-4 w-4" />,
  community: <Users className="h-4 w-4" />,
};

const emptyProvider: Partial<Provider> = {
  name: '',
  description: '',
  provider_type: 'independent',
  country: 'Ireland',
  website_url: '',
  is_verified: false,
  target_audience: [],
};

export default function AdminProviders() {
  const { data: providers, isLoading } = useProviders();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<Partial<Provider>>(emptyProvider);
  const [isSaving, setIsSaving] = useState(false);

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
      is_verified: provider.is_verified || false,
      target_audience: provider.target_audience || [],
    });
    setIsDialogOpen(true);
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
      if (selectedProvider) {
        // Update existing provider
        const { error } = await supabase
          .from('providers')
          .update({
            name: formData.name,
            description: formData.description,
            provider_type: formData.provider_type,
            country: formData.country,
            website_url: formData.website_url,
            is_verified: formData.is_verified,
            target_audience: formData.target_audience,
          })
          .eq('id', selectedProvider.id);

        if (error) throw error;
        toast.success('Provider updated successfully');
      } else {
        // Create new provider
        const { error } = await supabase
          .from('providers')
          .insert({
            name: formData.name,
            description: formData.description,
            provider_type: formData.provider_type as ProviderType,
            country: formData.country || 'Ireland',
            website_url: formData.website_url,
            is_verified: formData.is_verified,
            target_audience: formData.target_audience,
          });

        if (error) throw error;
        toast.success('Provider created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save provider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProvider) return;

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', selectedProvider.id);

      if (error) throw error;
      toast.success('Provider deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete provider');
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
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
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
                          onClick={() => handleOpenEdit(provider)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDelete(provider)}
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
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedProvider ? 'Save Changes' : 'Create Provider'}
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
      </div>
    </AdminLayout>
  );
}
