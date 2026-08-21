import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit2,
  Check,
  User as UserIcon,
  MessageSquare,
  Paperclip,
  Upload,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { taskService } from '../../services/task.service';
import { commentService } from '../../services/collaboration.service';
import { uploadService } from '../../services/extra.service';
import { useAuth } from '../../context/AuthContext';
import { Badge, Avatar, Button } from '../../components/ui';

export const TaskDetailsDrawer = ({ task, isOpen, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [currentTask, setCurrentTask] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Attachment upload state
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    setCurrentTask(task);
    if (task?._id && isOpen) {
      loadComments(task._id);
    }
  }, [task, isOpen]);

  const loadComments = async (taskId) => {
    try {
      setLoadingComments(true);
      const data = await commentService.getComments({ taskId });
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(currentTask._id, newStatus);
      setCurrentTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubtaskToggle = async (index) => {
    const updatedSubtasks = [...(currentTask.subtasks || [])];
    updatedSubtasks[index].isCompleted = !updatedSubtasks[index].isCompleted;

    try {
      const updated = await taskService.updateTask(currentTask._id, {
        subtasks: updatedSubtasks,
      });
      setCurrentTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError('');
    setUploadingAttachment(true);

    try {
      const uploadRes = await uploadService.uploadAttachment(file);
      const newAttachment = {
        name: uploadRes.name || file.name,
        url: uploadRes.url,
        publicId: uploadRes.publicId,
        format: uploadRes.format,
        size: uploadRes.size,
        uploadedAt: new Date(),
      };

      const updatedAttachments = [...(currentTask.attachments || []), newAttachment];
      const updatedTask = await taskService.updateTask(currentTask._id, {
        attachments: updatedAttachments,
      });

      setCurrentTask(updatedTask);
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (err) {
      setAttachmentError(err.message || 'Failed to upload attachment to Cloudinary.');
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await commentService.createComment({
        task: currentTask._id,
        project: currentTask.project?._id || currentTask.project,
        content: newComment.trim(),
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen || !currentTask) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white shadow-2xl z-10 flex flex-col h-full animate-fade-in border-l border-slate-200">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                currentTask.status === 'COMPLETED'
                  ? 'success'
                  : currentTask.status === 'IN_PROGRESS'
                  ? 'info'
                  : 'default'
              }
            >
              {currentTask.status}
            </Badge>
            <Badge
              variant={
                currentTask.priority === 'CRITICAL'
                  ? 'danger'
                  : currentTask.priority === 'HIGH'
                  ? 'warning'
                  : 'default'
              }
            >
              {currentTask.priority}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{currentTask.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
              {currentTask.description || 'No description provided.'}
            </p>
          </div>

          {/* Quick Status Bar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Workflow Status
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                    currentTask.status === st
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-white text-slate-600 border hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assignee
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={currentTask.assignedTo?.name || 'Unassigned'} size="sm" />
                <span className="font-semibold text-slate-800">
                  {currentTask.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Due Date
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {currentTask.deadline
                    ? new Date(currentTask.deadline).toLocaleDateString()
                    : 'No deadline'}
                </span>
              </div>
            </div>
          </div>

          {/* Cloudinary Attachments Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                Attachments ({currentTask.attachments?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAttachment}
                className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingAttachment ? 'Uploading to Cloudinary...' : 'Add File'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {attachmentError && (
              <p className="text-xs text-rose-600 mb-2">{attachmentError}</p>
            )}

            <div className="space-y-2">
              {currentTask.attachments?.length > 0 ? (
                currentTask.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#0F766E] shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-teal-700 transition-colors"
                      title="Open in Cloudinary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all"
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-600">Click to upload attachments</p>
                  <p className="text-[10px] text-slate-400">Powered by Cloudinary</p>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks Checklist */}
          {currentTask.subtasks?.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Subtasks ({currentTask.subtasks.filter((s) => s.isCompleted).length}/
                {currentTask.subtasks.length})
              </span>
              <div className="space-y-2">
                {currentTask.subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSubtaskToggle(idx)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                      st.isCompleted
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-teal-600/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleSubtaskToggle(idx)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                    />
                    <span className="font-medium">{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Comments ({comments.length})
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.user?.name} src={c.user?.profileImage} size="sm" />
                        <span className="font-semibold text-slate-900">{c.user?.name || 'User'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 pl-8 leading-relaxed">{c.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No comments yet. Start the conversation!</p>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white"
              />
              <Button type="submit" size="sm" loading={submittingComment} disabled={!newComment.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
