import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

export const Dashboard = () => {
  const { userProfile } = useAuth();

  // Mock data - would come from Firebase in real implementation
  const stats = [
    {
      title: 'Total Users',
      value: 47,
      change: { value: 12, trend: 'up' as const },
      icon: Users,
      description: 'Active team members'
    },
    {
      title: 'Active Tasks',
      value: 23,
      change: { value: 8, trend: 'up' as const },
      icon: ClipboardList,
      description: 'Currently in progress'
    },
    {
      title: 'Completed Today',
      value: 15,
      change: { value: 5, trend: 'up' as const },
      icon: CheckCircle2,
      description: 'Tasks finished today'
    },
    {
      title: 'Overdue Tasks',
      value: 3,
      change: { value: 2, trend: 'down' as const },
      icon: AlertTriangle,
      description: 'Requires attention'
    }
  ];

  const operatorStats = [
    {
      title: 'My Tasks',
      value: 5,
      change: { value: 2, trend: 'up' as const },
      icon: ClipboardList,
      description: 'Assigned to you'
    },
    {
      title: 'Completed',
      value: 12,
      change: { value: 15, trend: 'up' as const },
      icon: CheckCircle2,
      description: 'This week'
    },
    {
      title: 'Efficiency',
      value: '94%',
      change: { value: 3, trend: 'up' as const },
      icon: TrendingUp,
      description: 'Task completion rate'
    },
    {
      title: 'Avg Time',
      value: '2.3h',
      change: { value: 5, trend: 'down' as const },
      icon: Clock,
      description: 'Per task completion'
    }
  ];

  const displayStats = userProfile?.role === 'operator' ? operatorStats : stats;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Welcome back, {userProfile?.displayName}!
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.role === 'admin' 
                ? 'Manage your workforce and monitor system performance'
                : userProfile?.role === 'supervisor'
                ? 'Oversee team activities and task assignments'
                : 'View your tasks and update progress'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center animate-float">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};