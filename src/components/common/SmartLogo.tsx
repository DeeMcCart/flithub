import { useState, useRef } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartLogoProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function SmartLogo({ src, alt, className, fallbackClassName }: SmartLogoProps) {
  const [bgMode, setBgMode] = useState<'light' | 'dark' | 'loading'>('loading');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const analyzeImage = (img: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setBgMode('light');
        return;
      }

      // Use a small sample size for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      let lightPixels = 0;
      let totalVisiblePixels = 0;

      // Analyze pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip fully transparent pixels
        if (a < 10) continue;

        totalVisiblePixels++;

        // Calculate luminance (perceived brightness)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        
        // Consider pixel "light" if luminance > 200 (out of 255)
        if (luminance > 200) {
          lightPixels++;
        }
      }

      // If more than 60% of visible pixels are light, use dark background
      const lightRatio = totalVisiblePixels > 0 ? lightPixels / totalVisiblePixels : 0;
      setBgMode(lightRatio > 0.6 ? 'dark' : 'light');
    } catch (e) {
      // CORS or other errors - default to light
      setBgMode('light');
    }
  };

  const handleLoad = () => {
    if (imgRef.current) {
      analyzeImage(imgRef.current);
    }
  };

  const handleError = () => {
    setHasError(true);
    setBgMode('light');
  };

  if (!src || hasError) {
    return (
      <div className={cn(
        "rounded bg-muted flex items-center justify-center",
        fallbackClassName || className
      )}>
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded border border-border flex items-center justify-center overflow-hidden transition-colors",
      bgMode === 'dark' ? 'bg-slate-700' : 'bg-white',
      bgMode === 'loading' ? 'bg-muted' : '',
      className
    )}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        className={cn(
          "h-full w-full object-contain p-0.5",
          bgMode === 'loading' ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
