import React, { useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui';
import { projectService } from '../../services/project.service';

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [status, setStatus] = useState('ACTIVE');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newProj = await projectService.createProject({
        name,
        description,
        priority,
        status,
        deadline: deadline || undefined,
      });
      setName('');
      setDescription('');
      setDeadline('');
      onProjectCreated(newProj);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. College Event Management System"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-slate-400"
            placeholder="Outline goals, deliverables, and scope for this project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'PLANNING', label: 'Planning' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
          />
        </div>

        <Input
          label="Target Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
