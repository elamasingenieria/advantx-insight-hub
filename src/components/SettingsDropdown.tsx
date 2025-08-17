import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Moon,
  Sun,
  Monitor,
  Palette,
  Check,
} from 'lucide-react';

export function SettingsDropdown() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      setIsOpen(false); // Close dropdown first
      
      // Add loading state or disable button to prevent double clicks
      const result = await signOut();
      console.log('Sign out result:', result);
      console.log('Sign out successful, navigating to auth...');
      
      // Force navigation with replace to prevent back button issues
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Still navigate to auth page even if there's an error
      navigate('/auth', { replace: true });
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

        {/* Theme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2 cursor-pointer">
            <Palette className="h-4 w-4" />
            <span className="text-sm">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem 
              onClick={() => setTheme('light')}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            >
              <Sun className="h-4 w-4" />
              <span className="text-sm">Light</span>
              {theme === 'light' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme('dark')}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            >
              <Moon className="h-4 w-4" />
              <span className="text-sm">Dark</span>
              {theme === 'dark' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme('system')}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            >
              <Monitor className="h-4 w-4" />
              <span className="text-sm">System</span>
              {theme === 'system' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

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
