import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const QuickActions = () => {
  const { userProfile } = useAuth();

  const actions = [
    {
      title: 'Create Task',
      description: 'Assign new task to team',
      icon: Plus,
      action: () => console.log('Create task'),
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Add User',
      description: 'Register new team member',
      icon: UserPlus,
      action: () => console.log('Add user'),
      roles: ['admin']
    },
    {
      title: 'Upload Document',
      description: 'Add to instruction library',
      icon: FileText,
      action: () => console.log('Upload document'),
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Report Issue',
      description: 'Submit system feedback',
      icon: AlertCircle,
      action: () => console.log('Report issue'),
      roles: ['admin', 'supervisor', 'operator']
    }
  ];

  const filteredActions = actions.filter(action => 
    userProfile?.role && action.roles.includes(userProfile.role)
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={action.action}
                className="h-auto p-4 justify-start glass hover:bg-gradient-primary/10 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-primary p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};