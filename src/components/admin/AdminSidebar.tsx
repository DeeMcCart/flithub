import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileStack, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/pending', icon: Clock, label: 'Pending Review' },
  { to: '/admin/approved', icon: CheckCircle, label: 'Approved' },
  { to: '/admin/rejected', icon: XCircle, label: 'Rejected' },
];

const managementItems = [
  { to: '/admin/resources', icon: FileStack, label: 'All Resources' },
  { to: '/admin/providers', icon: Building2, label: 'Providers' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-card border-r min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-primary">
          Admin Portal
        </h2>
        <p className="text-sm text-muted-foreground">
          Content Review System
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Review Queue
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.to, item.end)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}

        <Separator className="my-4" />

        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Management
        </p>
        {managementItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.to)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <NavLink
          to="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive('/admin/settings')
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
