import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  HelpCircle,
  LogOut,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react';

export function SettingsDropdown() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHelp = () => {
    // First try to open external help, then fallback to internal help
    window.open('https://clientes.advantx.co/help', '_blank');
    // Also navigate to internal help as backup
    navigate('/help');
    setIsOpen(false);
  };

  const handleSettings = () => {
    // TODO: Implement settings page navigation
    console.log('Settings clicked');
    setIsOpen(false);
  };

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-2" 
        align="end" 
        side="bottom" 
        sideOffset={8}
      >
        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {profile?.full_name || 'User'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Email */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2 cursor-default focus:bg-transparent"
          onSelect={(e) => e.preventDefault()}
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </DropdownMenuItem>

        {/* Help */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={handleHelp}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm">Help</span>
          <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
