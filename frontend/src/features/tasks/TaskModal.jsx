import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../components/ui';
import { taskService } from '../../services/task.service';

export const TaskModal = ({
  isOpen,
  onClose,
  projectId,
  projectMembers = [],
  taskToEdit = null,
  onTaskSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setStatus(taskToEdit.status || 'TODO');
      setAssignedTo(taskToEdit.assignedTo?._id || taskToEdit.assignedTo || '');
      setDeadline(
        taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split('T')[0] : ''
      );
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setAssignedTo('');
      setDeadline('');
      setSubtasks([]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let savedTask;
      const payload = {
        project: projectId,
        title,
        description,
        priority,
        status,
        assignedTo: assignedTo || null,
        deadline: deadline || null,
        subtasks,
      };

      if (taskToEdit) {
        savedTask = await taskService.updateTask(taskToEdit._id, payload);
      } else {
        savedTask = await taskService.createTask(payload);
      }

      onTaskSaved(savedTask);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Implement user authentication endpoints"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-slate-400"
            placeholder="Details, technical specifications, and requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'TODO', label: 'To Do' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'REVIEW', label: 'Review' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />

          <Select
            label="Assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.role})
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {/* Subtasks Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Subtasks Checklist
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add actionable subtask step..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtask}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="truncate text-slate-700">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
