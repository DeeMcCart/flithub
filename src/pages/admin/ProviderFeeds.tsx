import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface FeedRow {
  id: string;
  provider_id: string;
  feed_url: string;
  feed_type: string;
  resource_type: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_status: string | null;
  last_error: string | null;
  last_items_found: number | null;
  last_items_added: number | null;
  providers?: { name: string } | null;
}

export default function ProviderFeeds() {
  const qc = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data: feeds, isLoading } = useQuery({
    queryKey: ['provider-feeds'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('provider_feeds')
        .select('*, providers(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FeedRow[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('provider_feeds')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-feeds'] }),
  });

  const runSync = async (feedId?: string) => {
    setSyncingId(feedId ?? 'all');
    try {
      const { data, error } = await supabase.functions.invoke('sync-provider-feeds', {
        body: { feedId, triggeredBy: 'manual' },
      });
      if (error) throw error;
      const results = (data as any)?.results ?? [];
      const added = results.reduce((n: number, r: any) => n + (r.itemsAdded ?? 0), 0);
      const found = results.reduce((n: number, r: any) => n + (r.itemsFound ?? 0), 0);
      const errs = results.filter((r: any) => r.status === 'error');
      if (errs.length) {
        toast.error(`Sync completed with ${errs.length} error(s). Added ${added} of ${found}.`);
      } else {
        toast.success(`Sync complete. Added ${added} new item(s) (found ${found}).`);
      }
      qc.invalidateQueries({ queryKey: ['provider-feeds'] });
    } catch (e: any) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Provider Feeds</h1>
            <p className="text-muted-foreground">
              Configured scrapers that periodically import resources (e.g. podcast episodes) from provider websites.
            </p>
          </div>
          <Button onClick={() => runSync()} disabled={!!syncingId}>
            {syncingId === 'all' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync All Active
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Feed</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Last Result</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(feeds ?? []).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.providers?.name ?? '—'}</TableCell>
                    <TableCell>
                      <a href={f.feed_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                        {new URL(f.feed_url).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell><Badge variant="outline">{f.feed_type}</Badge></TableCell>
                    <TableCell>
                      <Switch
                        checked={f.is_active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: f.id, is_active: v })}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {f.last_synced_at ? formatDistanceToNow(new Date(f.last_synced_at), { addSuffix: true }) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {f.last_status === 'success' ? (
                        <Badge variant="default" className="bg-green-600">
                          {f.last_items_added}/{f.last_items_found} added
                        </Badge>
                      ) : f.last_status === 'error' ? (
                        <Badge variant="destructive" title={f.last_error ?? ''}>Error</Badge>
                      ) : (
                        <Badge variant="secondary">—</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSync(f.id)}
                        disabled={!!syncingId}
                      >
                        {syncingId === f.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync now'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!feeds?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No feeds configured yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
