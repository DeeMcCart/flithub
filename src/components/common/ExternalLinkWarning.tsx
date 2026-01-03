import { ExternalLink, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ReactNode, useState } from 'react';

interface ExternalLinkWarningProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ExternalLinkWarning({ href, children, className }: ExternalLinkWarningProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleContinue = () => {
    window.open(href, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button className={className}>
          {children}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Leaving FlitHub
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You are about to leave FlitHub and visit an external website:
            </p>
            <p className="font-mono text-sm bg-muted p-2 rounded break-all">
              {getDomain(href)}
            </p>
            <p>
              FlitHub is not responsible for the content of external websites. 
              Please be aware that external sites may have different privacy policies 
              and terms of service.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay on FlitHub</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Continue to Website
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
