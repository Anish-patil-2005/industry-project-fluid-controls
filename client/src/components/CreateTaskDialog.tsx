import React from "react";

export default function TaskForm({ taskForm, setTaskForm, operators, onSave, onCancel, editing }) {
  // Toggle assign for multi-select
  function toggleAssign(operatorId) {
    setTaskForm((prev) => {
      const assigned = prev.assignedTo || [];
      if (assigned.includes(operatorId)) return { ...prev, assignedTo: assigned.filter((a) => a !== operatorId) };
      return { ...prev, assignedTo: [...assigned, operatorId] };
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">{editing ? "Edit Task" : "Create Task"}</h2>
        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deadline</label>
            <input
              type="date"
              value={taskForm.deadline}
              onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="mb-4">
  <label className="font-medium mb-1 block">Assign To</label>
  <div className="flex flex-wrap gap-2">
    {operators.map(op => (
      <label key={op.id} className="flex items-center gap-1">
        <input
  type="checkbox"
  checked={taskForm.assignedTo.includes(op.id)}
  onChange={() => toggleAssign(op.id)}
/>

        {op.name}
      </label>
    ))}
  </div>
</div>


          <div className="md:col-span-2 flex gap-2 justify-end mt-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{editing ? "Save" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
