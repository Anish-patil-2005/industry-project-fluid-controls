import React, { useState, useMemo, useEffect } from "react";
import TaskForm from "./CreateTaskDialog";
import DocumentTab from "./DocumentsTab.js";

import { 
  getTasksAPI,
  deleteTaskAPI,
  updateStatusAPI,
  createTaskAPI,
  editTaskAPI,
  assignTaskAPI,
  getAllOperatorsAPI
} from "../services/apiTask.services.js";

export default function SupervisorDashboard() {
  // Mock profile
  const profile = { name: "Anish Patil", role: "Supervisor" };

  // Operators state
  const [operators, setOperators] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);

  // Tasks & Documents state
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Task form state
  const initialForm = { title: "", description: "", deadline: "", priority: "Medium", assignedTo: [] };
  const [taskForm, setTaskForm] = useState(initialForm);

  // Document upload form
  const [docForm, setDocForm] = useState({ title: "", filter: "Safety", file: null });

  // Derived counts
  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Completed").length;
    const members = operators.length;
    return { total, completed, overdue, members };
  }, [tasks, operators]);

  // Fetch operators from backend
  useEffect(() => {
    async function fetchOperators() {
      try {
        const res = await getAllOperatorsAPI();
        if (res.data.success) {
          const allOps = res.data.operators.map(op => ({
            id: op._id,
            name: op.name,
            email: op.email,
            totalTasks: op.totalTasks || 0
          }));
          setOperators(allOps);
        }
      } catch (err) {
        console.error("Error fetching operators:", err);
      }
    }
    fetchOperators();
  }, []);

  // Fetch tasks from backend
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await getTasksAPI();
        if (res.data.success) {
          setTasks(res.data.tasks.map(t => ({
            ...t,
            _id: t._id,
            assignedTo: t.assignedTo?.map(u => u._id) || [],
          })));
        }
      } catch (err) {
        console.error("Error fetching tasks", err);
      }
    }
    fetchTasks();
  }, []);

  // Update available operators whenever tasks or operators change
  useEffect(() => {
    const available = operators.filter(op => {
      const activeTasks = tasks.filter(
        t => t.assignedTo.includes(op.id) && t.status !== "Completed"
      ).length;
      return activeTasks < 3; // available if less than 3 active tasks
    });
    setAvailableOperators(available);
  }, [tasks, operators]);

  // --- Task Handlers ---
  const saveTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title || !taskForm.deadline) {
      return alert("Please provide title and deadline");
    }

    try {
      let taskId;

      if (editingTaskId) {
        // --- EDIT TASK ---
        const res = await editTaskAPI(editingTaskId, taskForm);
        if (res.data.success) {
          taskId = editingTaskId;
          setTasks(prev =>
            prev.map(t =>
              t._id === editingTaskId
                ? { ...res.data.task, assignedTo: res.data.task.assignedTo?.map(u => u._id) || [] }
                : t
            )
          );

          if (taskForm.assignedTo?.length) {
            await assignTaskAPI(taskId, { assignedTo: taskForm.assignedTo });
            setTasks(prev =>
              prev.map(t =>
                t._id === editingTaskId ? { ...t, assignedTo: taskForm.assignedTo } : t
              )
            );
          }
        }
      } else {
        // --- CREATE TASK ---
        const res = await createTaskAPI(taskForm);
        if (res.data.success) {
          const newTask = res.data.data;
          taskId = newTask._id;

          if (taskForm.assignedTo?.length) {
            const assignRes = await assignTaskAPI(taskId, { assignedTo: taskForm.assignedTo });
            newTask.assignedTo = assignRes.data.task.assignedTo || [];
          }

          setTasks(prev => [newTask, ...prev]);
        }
      }

      setShowTaskForm(false);
      setTaskForm(initialForm);
      setEditingTaskId(null);
    } catch (err) {
      console.error("Error saving task", err);
      alert(err.response?.data?.message || "Failed to save task");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await deleteTaskAPI(id);
      if (res.data.success) setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error("Error deleting task", err);
      alert("Failed to delete task");
    }
  };

  const changeTaskStatus = async (id, status) => {
    try {
      const res = await updateStatusAPI(id, status);
      if (res.data.success) setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update status");
    }
  };

  const openCreateTask = () => {
    setEditingTaskId(null);
    setTaskForm(initialForm);
    setShowTaskForm(true);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      priority: task.priority,
      assignedTo: task.assignedTo || [],
    });
    setShowTaskForm(true);
  };

  const toggleAssign = (operatorId) => {
    setTaskForm(prev => {
      const assigned = prev.assignedTo || [];
      if (assigned.includes(operatorId)) return { ...prev, assignedTo: assigned.filter(a => a !== operatorId) };
      return { ...prev, assignedTo: [...assigned, operatorId] };
    });
  };

  const handleDocUpload = (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.file) return alert("Please provide a title and file");
    const newDoc = { id: "doc_" + Math.random().toString(36).slice(2,9), title: docForm.title, filter: docForm.filter, fileName: docForm.file.name, uploadedAt: new Date().toISOString() };
    setDocuments(prev => [newDoc, ...prev]);
    setDocForm({ title: "", filter: "Safety", file: null });
  };

  const updateTaskField = (id, field, value) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">FC</div>
            <div>
              <div className="text-xl font-semibold text-blue-700">Fluid Controls Pvt. Ltd.</div>
              <div className="text-sm text-gray-500">Supervisor Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-gray-500">{profile.role}</div>
            </div>
            <button className="px-3 py-2 rounded-md bg-blue-600 text-white">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Tasks" value={counts.total} icon="clock" />
          <StatCard title="Completed" value={counts.completed} icon="check" />
          <StatCard title="Overdue" value={counts.overdue} icon="alert" />
          <StatCard title="Team Members" value={counts.members} icon="users" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-1 mb-6 flex gap-1 items-center">
          <Tab label="Task Management" active={activeTab==="tasks"} onClick={()=>setActiveTab("tasks")} />
          <Tab label="Team Overview" active={activeTab==="team"} onClick={()=>setActiveTab("team")} />
          <Tab label="Upload Document" active={activeTab==="docs"} onClick={()=>setActiveTab("docs")} />
          <Tab label="Analytics" active={activeTab==="analytics"} onClick={()=>setActiveTab("analytics")} />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab==="tasks" && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Task Management</h2>
                  <p className="text-sm text-gray-500">Create, assign, and monitor tasks</p>
                </div>
                <div>
                  <button onClick={openCreateTask} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md">+ Create Task</button>
                </div>
              </div>

              {showTaskForm && (
                <TaskForm
                  taskForm={taskForm}
                  setTaskForm={setTaskForm}
                  operators={availableOperators}
                  onSave={saveTask}
                  onCancel={()=>setShowTaskForm(false)}
                  editing={!!editingTaskId}
                />
              )}

              <div className="overflow-auto">
                {tasks.length===0 ? (
                  <div className="py-12 text-center text-red-500">No tasks yet — create one using the button above.</div>
                ) : (
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="py-2 px-2">Title</th>
                        <th className="py-2 px-2">Description</th>
                        <th className="py-2 px-2">Deadline</th>
                        <th className="py-2 px-2">Priority</th>
                        <th className="py-2 px-2">Assigned To</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t._id} className="align-top border-b">
                          <td className="py-3 px-2 w-40">{t.title}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{t.description}</td>
                          <td className="py-3 px-2">{t.deadline?.split("T")[0]}</td>
                          <td className="py-3 px-2">{t.priority}</td>
                          <td className="py-3 px-2 text-sm">
                            {t.assignedTo.length>0 ? (
                              <ul className="list-disc pl-5">
                                {t.assignedTo.map(a=>{
                                  const op = operators.find(o=>o.id===a);
                                  return <li key={a}>{op ? op.name : a}</li>;
                                })}
                              </ul>
                            ) : <span className="text-gray-400">Unassigned</span>}
                          </td>
                          <td className="py-3 px-2">{t.status}</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <button onClick={()=>openEditTask(t)} className="px-2 py-1 rounded border text-sm">Edit</button>
                              <button onClick={()=>deleteTask(t._id)} className="px-2 py-1 rounded border text-sm text-red-600">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Team Overview */}
          {activeTab === "team" && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Team Overview</h2>
                  <p className="text-sm text-gray-500">List of all team members and their roles</p>
                </div>
              </div>

              <div className="overflow-auto">
                {operators.length === 0 ? (
                  <div className="py-12 text-center text-red-500">No team members found.</div>
                ) : (
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="py-2 px-2">Sr. No.</th>
                        <th className="py-2 px-2">Name</th>
                        <th className="py-2 px-2">Email</th>
                        <th className="py-2 px-2">Role</th>
                        <th className="py-2 px-2">Availability Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operators.map((op, index) => {
                        const activeTasks = tasks.filter(
                          t => t.assignedTo.includes(op.id) && t.status !== "Completed"
                        ).length;
                        const availability = activeTasks >= 3 ? "Busy" : "Available";
                        return (
                          <tr key={op.id} className="border-b">
                            <td className="py-3 px-2">{index + 1}</td>
                            <td className="py-3 px-2">{op.name}</td>
                            <td className="py-3 px-2">{op.email}</td>
                            <td className="py-3 px-2">Operator</td>
                            <td className="py-3 px-2 text-gray-400">{availability}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === "docs" && <DocumentTab />}
        </div>
      </main>
    </div>
  );
}

/* --- Small helper components --- */
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
        {icon==="check"?"✓":icon==="alert"?"!":icon==="users"?"👥":"⏱"}
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return <button onClick={onClick} className={`px-4 py-2 ${active?"bg-white shadow rounded":"text-gray-500"}`}>{label}</button>;
}
