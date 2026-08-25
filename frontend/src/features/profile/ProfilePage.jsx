import React, { useState, useRef } from 'react';
import { User, Lock, Mail, Shield, Check, Save, Camera, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, uploadService } from '../../services/extra.service';
import { Card, Button, Input, Badge, Avatar } from '../../components/ui';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Avatar Upload State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image size must be under 10MB.');
      return;
    }

    setAvatarError('');
    setAvatarSuccess(false);
    setAvatarLoading(true);

    try {
      const res = await uploadService.uploadAvatar(file);
      if (res?.user) {
        updateUser(res.user);
      } else if (res?.url) {
        updateUser({ ...user, profileImage: res.url });
      }
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err) {
      setAvatarError(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      const updated = await userService.updateMyProfile({ name, bio });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);

    try {
      await userService.updateMyPassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Profile Card with Cloudinary Avatar Upload */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar name={user?.name} src={user?.profileImage} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#0F766E] text-white hover:bg-[#0D655E] shadow-md transition-all group-hover:scale-105"
              title="Upload new avatar to Cloudinary"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <Badge variant="teal">{user?.role?.replace('_', ' ')}</Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Cloud media powered by Cloudinary
            </p>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Upload}
            loading={avatarLoading}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarLoading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </div>
      </div>

      {avatarError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-fade-in">
          {avatarError}
        </div>
      )}

      {avatarSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> Avatar uploaded to Cloudinary successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#0F766E]">
            <User className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Profile Information</h3>
          </div>

          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bio / Responsibilities
              </label>
              <textarea
                rows={3}
                placeholder="A brief note about your responsibilities in the team..."
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <Button type="submit" loading={profileLoading} icon={Save} size="sm">
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#0F766E]">
            <Lock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Change Password</h3>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Password changed successfully!
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={passwordLoading} variant="outline" size="sm">
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
