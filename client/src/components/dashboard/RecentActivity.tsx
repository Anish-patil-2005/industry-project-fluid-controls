import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

interface Activity {
  id: string;
  type: 'task_completed' | 'task_assigned' | 'task_overdue' | 'user_joined';
  user: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'in_progress' | 'overdue';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    user: 'John Doe',
    description: 'Completed quality inspection for Batch #A-2024',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'task_assigned',
    user: 'Sarah Wilson',
    description: 'Assigned new maintenance task for Machine Line 3',
    timestamp: '4 hours ago',
    status: 'in_progress'
  },
  {
    id: '3',
    type: 'task_overdue',
    user: 'Mike Johnson',
    description: 'Safety inspection task is overdue by 2 days',
    timestamp: '6 hours ago',
    status: 'overdue'
  },
  {
    id: '4',
    type: 'user_joined',
    user: 'Emma Davis',
    description: 'New operator joined the team',
    timestamp: '1 day ago'
  }
];

export const RecentActivity = () => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed': return CheckCircle;
      case 'task_assigned': return Clock;
      case 'task_overdue': return AlertTriangle;
      case 'user_joined': return User;
    }
  };

  const getStatusBadge = (status?: Activity['status']) => {
    if (!status) return null;
    
    const variants = {
      completed: 'bg-success/20 text-success border-success/30',
      in_progress: 'bg-primary/20 text-primary border-primary/30',
      overdue: 'bg-destructive/20 text-destructive border-destructive/30'
    };

    return (
      <Badge className={`${variants[status]} text-xs`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg glass hover:bg-glass-bg transition-colors duration-200">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{activity.user}</span>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};