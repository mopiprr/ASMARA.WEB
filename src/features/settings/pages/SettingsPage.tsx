import { useState } from 'react';
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  LoaderCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import axios from 'axios';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import api from '../../../services/api';

function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showConfirmChangePassword, setShowConfirmChangePassword] = useState(false);

  const handlePreSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields.');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation password do not match.');
      setMessageType('error');
      return;
    }

    if (currentPassword === newPassword) {
      setMessage('New password must be different from current password.');
      setMessageType('error');
      return;
    }

    // Valid inputs, open confirmation dialog
    setShowConfirmChangePassword(true);
  };

  const executeChangePassword = async () => {
    try {
      setLoading(true);

      // Pakai api -> token otomatis di-refresh kalau expired.
      const response = await api.put<{ message?: string }>(
        '/account/change-password',
        { currentPassword, newPassword }
      );

      const data = response.data;

      // Reset form after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setMessage(data?.message || 'Password changed successfully.');
      setMessageType('success');
    } catch (error) {
      const data = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string; detail?: string } | undefined)
        : undefined;

      setMessage(
        data?.message ||
          data?.detail ||
          'Failed to change password.'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
      setShowConfirmChangePassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and security preferences.
        </p>
      </div>

      {/* ACCOUNT SECURITY */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="rounded-lg bg-blue-50 p-3">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Account Security
            </h2>
            <p className="text-sm text-gray-500">
              Manage your password and keep your account secure.
            </p>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">
              Change Password
            </h3>
          </div>

          <form
            onSubmit={handlePreSubmit}
            className="space-y-5"
          >
            {/* CURRENT PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Use a strong password that is difficult to guess.
                Minimum 8 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* NOTIFICATION */}
            {message && (
              <div
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  messageType === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {messageType === 'success' ? (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={19} className="mt-0.5 shrink-0" />
                )}

                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* ACTION */}
            <div className="border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CHANGE PASSWORD CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showConfirmChangePassword}
        title="Change Password"
        message="Are you sure you want to change your password?"
        description="Your password will be updated immediately. You will need to use your new password the next time you log in."
        type="warning"
        confirmText="Yes, Change Password"
        cancelText="Cancel"
        isLoading={loading}
        onConfirm={executeChangePassword}
        onCancel={() => {
          if (!loading) {
            setShowConfirmChangePassword(false);
          }
        }}
      />
    </div>
  );
}

export default SettingsPage;