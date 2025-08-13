import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole } from '@/contexts/AuthContext';

// User Operations
export const createUserProfile = async (uid: string, profile: Omit<UserProfile, 'uid'>) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...profile,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Task Operations
export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string; // user uid
  assignedBy: string; // user uid
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'on-hold' | 'completed';
  deadline: Timestamp;
  skills: string[];
  attachments?: string[];
  comments?: TaskComment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Timestamp;
}

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const taskData = {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'), 
      where('assignedTo', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const tasksSnapshot = await getDocs(q);
    return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
};

export const getTasksByStatus = async (status: Task['status']): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const tasksSnapshot = await getDocs(q);
    return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    throw error;
  }
};

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const tasksSnapshot = await getDocs(q);
    return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToUserTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'tasks'),
    where('assignedTo', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  });
};

export const subscribeToAllTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  });
};

// Instructions/Documents Operations
export interface Instruction {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  version: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  uploadedBy: string;
  accessRoles: UserRole[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createInstruction = async (instruction: Omit<Instruction, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const instructionData = {
      ...instruction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'instructions'), instructionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating instruction:', error);
    throw error;
  }
};

export const getInstructionsByRole = async (role: UserRole): Promise<Instruction[]> => {
  try {
    const q = query(
      collection(db, 'instructions'),
      where('accessRoles', 'array-contains', role),
      orderBy('createdAt', 'desc')
    );
    const instructionsSnapshot = await getDocs(q);
    return instructionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Instruction));
  } catch (error) {
    console.error('Error fetching instructions by role:', error);
    throw error;
  }
};

// Audit Logs Operations
export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType: 'task' | 'user' | 'instruction';
  entityId: string;
  timestamp: Timestamp;
}

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  try {
    const logData = {
      ...log,
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'auditLogs'), logData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

export const getAuditLogs = async (limitCount: number = 100): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const logsSnapshot = await getDocs(q);
    return logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Analytics Operations
export const getTaskAnalytics = async (startDate?: Date, endDate?: Date) => {
  try {
    let q = query(collection(db, 'tasks'));
    
    if (startDate && endDate) {
      q = query(
        collection(db, 'tasks'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
    }
    
    const tasksSnapshot = await getDocs(q);
    const tasks = tasksSnapshot.docs.map(doc => doc.data() as Task);
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      onHold: tasks.filter(t => t.status === 'on-hold').length,
      overdue: tasks.filter(t => t.deadline.toDate() < new Date() && t.status !== 'completed').length,
      byPriority: {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      }
    };
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    throw error;
  }
};

export const getUserAnalytics = async (userId: string) => {
  try {
    const userTasks = await getTasksByUser(userId);
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    
    return {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
      averageCompletionTime: calculateAverageCompletionTime(completedTasks),
      tasksByStatus: {
        pending: userTasks.filter(t => t.status === 'pending').length,
        inProgress: userTasks.filter(t => t.status === 'in-progress').length,
        completed: completedTasks.length,
        onHold: userTasks.filter(t => t.status === 'on-hold').length,
      }
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

// Helper function
const calculateAverageCompletionTime = (completedTasks: Task[]): number => {
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const createdAt = task.createdAt.toDate();
    const updatedAt = task.updatedAt.toDate();
    return sum + (updatedAt.getTime() - createdAt.getTime());
  }, 0);
  
  return totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
};