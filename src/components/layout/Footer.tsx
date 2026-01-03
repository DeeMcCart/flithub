import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-lg mb-3">About FlitHub</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              FlitHub is Ireland's central hub for trusted, non-promotional financial literacy resources. 
              We support learners, educators, and community groups in accessing quality financial education 
              aligned with Ireland's National Financial Literacy Strategy.
            </p>
            <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Our Promise:</strong> No product promotion, no lead generation, 
                no commercial bias. Just quality educational resources.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Resources
                </Link>
              </li>
              <li>
                <Link to="/providers" className="text-muted-foreground hover:text-primary transition-colors">
                  Trusted Providers
                </Link>
              </li>
              <li>
                <Link to="/start-here" className="text-muted-foreground hover:text-primary transition-colors">
                  Start Here
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit a Resource
                </Link>
              </li>
            </ul>
          </div>

          {/* External Resources */}
          <div>
            <h4 className="font-display font-semibold mb-3">Irish Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.ccpc.ie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  CCPC <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mabs.ie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  MABS <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ncca.ie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  NCCA <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FlitHub. Supporting Ireland's Financial Literacy Strategy.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> in Ireland
          </p>
        </div>
      </div>
    </footer>
  );
}
