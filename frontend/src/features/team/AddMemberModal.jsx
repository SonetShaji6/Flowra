import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, Avatar } from '../../components/ui';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/extra.service';

export const AddMemberModal = ({ isOpen, onClose, projectId, currentMembers = [], onMemberAdded }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        try {
          const allUsers = await userService.getUsers();
          const currentMemberIds = new Set(currentMembers.map((m) => (m._id || m).toString()));
          const nonMembers = (allUsers || []).filter(
            (u) => !currentMemberIds.has(u._id?.toString()) && u.isActive !== false
          );
          setAvailableUsers(nonMembers);
          if (nonMembers.length > 0) {
            setSelectedUserId(nonMembers[0]._id);
          } else {
            setSelectedUserId('');
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadUsers();
    }
  }, [isOpen, currentMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setError('');
    setLoading(true);

    try {
      const updatedProject = await projectService.addMember(projectId, selectedUserId);
      onMemberAdded(updatedProject);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add member to project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member to Project">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {availableUsers.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select User to Add
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => setSelectedUserId(u._id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedUserId === u._id
                      ? 'border-[#0F766E] bg-[#F0FDFA]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!selectedUserId}>
              Add to Team
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-slate-500 mb-4">
            All registered active workspace users are already members of this project.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
};
