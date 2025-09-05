import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle,
  Play,
  CheckSquare,
  FileText
} from 'lucide-react';
import { User } from '../App';
import { getTasksAPI, updateStatusAPI } from '../services/apiTask.services';
import apiClient from '../apiClient';
import { getAllDocumentsAPI } from '../services/apiDoc.services.js';
import DocumentTab from './DocumentsTab.js';
import OperatorDocumentTab from './DocumentOperator.js';

// --- Interfaces ---
interface Document {
  _id: string;
  title: string;
  version: string;
  filePath: string;
  fileType: string;
  uploadedBy: User;
  createdAt: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: User; 
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  deadline: string; 
  createdBy: User;
  comments: Comment[];
}

interface OperatorDashboardProps {
  user: User;
}

export function OperatorDashboard({ user }: OperatorDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [comment, setComment] = useState('');

  // --- Fetch Tasks & Documents ---
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [tasksRes, docsRes] = await Promise.all([
        getTasksAPI(),
        getAllDocumentsAPI() // use your exported API function
      ]);

      setTasks(tasksRes.data.tasks || []);
      setDocuments(docsRes.data.documents || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load your assigned tasks or documents.");
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);


  // --- Update Task Status ---
  const updateTaskStatus = async (taskId: string, newStatus: Task['status'], commentText?: string) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      const payload: { status: string; comment?: string } = { status: newStatus };
      if (commentText) payload.comment = commentText;

      const response = await updateStatusAPI(taskId, payload);
      setTasks(prev => prev.map(t => t._id === taskId ? response.data.task : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
      setTasks(originalTasks);
      alert("Failed to update task status. Please try again.");
    } finally {
      setCompletingTask(null);
      setComment('');
    }
  };

  // --- Handle Status Change ---
  const handleStatusChange = (task: Task, newStatus: Task['status']) => {
    if (newStatus === 'Completed') {
      setCompletingTask(task);
      setComment('');
    } else {
      updateTaskStatus(task._id, newStatus);
    }
  };

  // --- Submit Completion with Comment ---
  const handleCompleteTaskSubmit = () => {
    if (completingTask) {
      updateTaskStatus(completingTask._id, 'Completed', comment);
    }
  };

  // --- Cancel Completion ---
  const handleCancelCompletion = () => {
    setCompletingTask(null);
    setComment('');
  };

  // --- View Document ---
  const viewDocument = (doc: Document) => window.open(`http://localhost:5000${doc.filePath}`, "_blank");

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 text-slate-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-slate-100 text-slate-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const overdueTasks = tasks.filter(task => new Date(task.deadline) < new Date() && task.status !== 'Completed');

  const stats = [
    { title: 'My Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'bg-blue-500' },
    { title: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length.toString(), icon: Play, color: 'bg-orange-500' },
    { title: 'Completed', value: tasks.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Overdue', value: overdueTasks.length.toString(), icon: AlertTriangle, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h2>
        <p className="text-slate-600">You have {tasks.filter(t => t.status !== 'Completed').length} active tasks.</p>
        {overdueTasks.length > 0 && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {overdueTasks.length} overdue task(s).
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Tasks</CardTitle>
          <CardDescription>View and update your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-slate-500 py-8">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-slate-500 py-8">You have no tasks assigned to you.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => {
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';
                return (
                  <div key={task._id} className={`border rounded-lg p-4 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task, e.target.value as Task['status'])}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Comment box for completion */}
                    {completingTask?._id === task._id && (
                      <div className="mt-3 flex flex-col space-y-2">
                        <textarea
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-100 text-slate-800 hover:bg-blue-500 hover:text-white"
                            onClick={handleCompleteTaskSubmit}
                          >
                            Submit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-100 text-red-800 hover:bg-red-500 hover:text-white"
                            onClick={handleCancelCompletion}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-slate-600 mb-1">{task.description}</p>
                    <p className="text-xs text-slate-500">Assigned by: {task.createdBy?.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      {isOverdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
{/* Documents Section */}
<OperatorDocumentTab/>
    </div>
  );
}
