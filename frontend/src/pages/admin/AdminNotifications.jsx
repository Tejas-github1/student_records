import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Phone,
  Clock,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalFailed: 0, totalNotConfigured: 0 });
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Test Notification Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('+91 6305497264');
  const [testNote, setTestNote] = useState('Manual verification from admin control panel.');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Inspector modal for notification details
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotificationHistory();
  }, [statusFilter, search, page]);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/notifications', { params });
      setNotifications(res.data.notifications || []);
      setStats(res.data.stats || {});
      setWhatsappStatus(res.data.whatsappStatus || {});
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
      if (res.data.whatsappStatus?.recipient) {
        setTestRecipient(res.data.whatsappStatus.recipient);
      }
    } catch (err) {
      setError('Failed to load notification audit trail.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await api.post('/notifications/test', {
        recipient: testRecipient,
        note: testNote,
      });
      setTestResult(res.data.result);
      fetchNotificationHistory();
    } catch (err) {
      setTestResult({
        success: false,
        errorMessage: err.response?.data?.message || 'Error executing test notification',
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            WhatsApp Business Integration
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            WhatsApp Failure Alerts Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official WhatsApp Cloud API delivery logs for recipient{' '}
            <span className="font-mono font-bold text-slate-800">+91 6305497264</span>
          </p>
        </div>

        <button
          onClick={() => {
            setTestResult(null);
            setShowTestModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Send className="h-4 w-4" />
          <span>Send Test WhatsApp Alert</span>
        </button>
      </div>

      {/* Integration Setup Status Banner */}
      {whatsappStatus && !whatsappStatus.isConfigured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-900 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">
                WhatsApp Cloud API is not configured in backend environment
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                When a student fails an exam, the alert is automatically captured and logged with status{' '}
                <span className="rounded bg-amber-200/70 px-1.5 py-0.5 font-mono font-bold text-amber-900">NOT_CONFIGURED</span>{' '}
                to preserve audit integrity without pretending delivery succeeded.
              </p>
              <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs border border-amber-200/60 font-mono text-slate-800">
                <span className="text-slate-400 block font-sans font-semibold mb-1">To enable live Meta Cloud delivery:</span>
                1. Set <span className="text-blue-700 font-bold">WHATSAPP_PHONE_NUMBER_ID</span> in backend/.env<br />
                2. Set <span className="text-blue-700 font-bold">WHATSAPP_API_TOKEN</span> in backend/.env<br />
                3. Recipient is currently targeted at: <span className="text-emerald-700 font-bold">{whatsappStatus.recipient || '+91 6305497264'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">WhatsApp Cloud API is Connected & Live</h3>
              <p className="text-xs text-emerald-700">
                Automatic failure alerts will be delivered instantly to{' '}
                <span className="font-mono font-bold">{whatsappStatus?.recipient}</span> upon exam evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Alerts</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[10px] text-slate-400">Recorded events</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Delivered</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">{stats.totalSent}</div>
          <span className="text-[10px] text-slate-400">Meta Cloud API success</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Simulated / Setup</span>
          <div className="mt-2 text-2xl font-black text-amber-600">{stats.totalNotConfigured}</div>
          <span className="text-[10px] text-slate-400">Logged (Pending Tokens)</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Failed</span>
          <div className="mt-2 text-2xl font-black text-rose-600">{stats.totalFailed}</div>
          <span className="text-[10px] text-slate-400">Provider rejections</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, ID, exam, or recipient..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="SENT">Delivered (SENT)</option>
          <option value="NOT_CONFIGURED">Not Configured</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Audit History Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notification history...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No WhatsApp alert records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Trigger / Event</th>
                  <th className="px-6 py-4">Student & Exam</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  let statusBadge = 'fail';
                  if (n.status === 'SENT') statusBadge = 'pass';
                  if (n.status === 'NOT_CONFIGURED') statusBadge = 'warning';

                  return (
                    <tr key={n._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {n.recipient}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          WhatsApp Cloud
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {n.messageType === 'WHATSAPP_FAILURE_ALERT' ? (
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Exam Failure Alert</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Manual Test Alert</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {n.studentName ? (
                          <>
                            <div className="font-semibold text-slate-800">{n.studentName} ({n.studentId})</div>
                            <div className="text-[11px] text-slate-400">{n.examTitle}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">System Test</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadge}>
                          {n.status === 'NOT_CONFIGURED' ? 'NOT CONFIGURED' : n.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(n.sentAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedNotification(n)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          View Message
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            <span>
              Showing {notifications.length} of {totalCount} records
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test WhatsApp Alert Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Send Test WhatsApp Notification"
      >
        <form onSubmit={handleSendTestNotification} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Send an instant test alert to verify delivery to the configured recipient phone number.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recipient Phone Number (with Country Code)
            </label>
            <input
              type="text"
              required
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="+91 6305497264"
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Admin Verification Note (Optional)
            </label>
            <textarea
              rows="2"
              value={testNote}
              onChange={(e) => setTestNote(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {testResult && (
            <div
              className={`rounded-xl p-3 border ${
                testResult.status === 'SENT'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.status === 'SENT' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span>Status: {testResult.status}</span>
              </div>
              <p className="mt-1 text-[11px]">
                {testResult.message || testResult.errorMessage || 'Audit log updated successfully.'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowTestModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={sendingTest}
              className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow"
            >
              {sendingTest ? 'Sending...' : 'Send WhatsApp Test'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Message Content Viewer Modal */}
      <Modal
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        title="WhatsApp Notification Message Payload"
        maxWidth="max-w-xl"
      >
        {selectedNotification && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipient</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedNotification.recipient}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                <Badge
                  variant={
                    selectedNotification.status === 'SENT'
                      ? 'pass'
                      : selectedNotification.status === 'NOT_CONFIGURED'
                      ? 'warning'
                      : 'fail'
                  }
                >
                  {selectedNotification.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Delivered Message Body:
              </label>
              <pre className="rounded-xl bg-slate-900 p-4 text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {selectedNotification.messageBody}
              </pre>
            </div>

            {selectedNotification.errorMessage && (
              <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-rose-800">
                <span className="font-bold block">Error / Diagnosis:</span>
                <span className="text-[11px]">{selectedNotification.errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
