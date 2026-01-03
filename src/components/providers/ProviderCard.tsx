import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Building2, Globe, Users, Heart } from 'lucide-react';
import type { Provider, ProviderType } from '@/types/database';

interface ProviderCardProps {
  provider: Provider;
}

const providerIcons: Record<ProviderType, React.ReactNode> = {
  government: <Building2 className="h-5 w-5" />,
  independent: <Heart className="h-5 w-5" />,
  international: <Globe className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
};

const providerColors: Record<ProviderType, string> = {
  government: 'badge-government',
  independent: 'badge-independent',
  international: 'badge-international',
  community: 'badge-community',
};

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${providerColors[provider.provider_type]}`}>
            {providerIcons[provider.provider_type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {provider.name}
              </h3>
              {provider.is_verified && (
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {provider.country}
              </Badge>
              <Badge className={`text-xs ${providerColors[provider.provider_type]}`}>
                {provider.provider_type.charAt(0).toUpperCase() + provider.provider_type.slice(1)}
              </Badge>
            </div>
            
            {provider.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {provider.description}
              </p>
            )}
            
            {provider.target_audience && provider.target_audience.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {provider.target_audience.slice(0, 4).map((audience) => (
                  <Badge key={audience} variant="secondary" className="text-xs">
                    {audience}
                  </Badge>
                ))}
                {provider.target_audience.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{provider.target_audience.length - 4} more
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              {provider.website_url && (
                <a
                  href={provider.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Link
                to={`/resources?provider=${provider.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                View Resources →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
