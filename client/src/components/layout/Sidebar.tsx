import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Bell, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'supervisor', 'operator'] },
    { path: '/users', icon: Users, label: 'User Management', roles: ['admin', 'supervisor'] },
    { path: '/tasks', icon: ClipboardList, label: 'Task Management', roles: ['admin', 'supervisor', 'operator'] },
    { path: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'supervisor', 'operator'] },
    { path: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'supervisor', 'operator'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'supervisor'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'supervisor', 'operator'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    userProfile?.role && item.roles.includes(userProfile.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 glass-card z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold gradient-text">WorkForce</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-glass-border">
          <div className="flex items-center space-x-3">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-white">
                {userProfile?.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${active 
                        ? 'bg-gradient-primary text-white shadow-glow' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-glass-bg'
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) onToggle();
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-glass-border">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};