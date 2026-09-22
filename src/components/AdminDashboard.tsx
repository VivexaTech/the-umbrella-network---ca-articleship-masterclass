import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Settings,
  MessageSquare,
  Award,
  Link,
  Lock,
  LogOut,
  RefreshCw,
  ExternalLink,
  Database,
  Copy,
  Check,
  Mail,
  FolderOpen,
  Send,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  Camera,
  Upload,
} from 'lucide-react';
import type { Batch, Registration, WebsiteSettings, Speaker, Testimonial } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchesUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onBatchesUpdated,
}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('un_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'students' | 'emails' | 'supabase' | 'stats' | 'testimonials' | 'speakers'>('overview');

  const [overview, setOverview] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Registration[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [emailsData, setEmailsData] = useState<{ total: number; status: any; emails: any[] } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseRecords, setSupabaseRecords] = useState<any[]>([]);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Batch Form State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchForm, setBatchForm] = useState({
    batch_number: '',
    name: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    fee: 999,
    whatsapp_link: '',
    max_seats: 100,
    status: 'active' as Batch['status'],
    description: '',
  });

  // Student Search / Filter State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (token && isOpen) {
      loadAllData();
    }
  }, [token, isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('un_admin_token', data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError('Server communication error.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('un_admin_token');
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Overview
      const ovRes = await fetch('/api/admin/dashboard', { headers });
      if (ovRes.ok) {
        const ovJson = await ovRes.json();
        setOverview(ovJson.overview);
      }

      // 2. Batches
      const bRes = await fetch('/api/admin/batches', { headers });
      if (bRes.ok) {
        const bJson = await bRes.json();
        setBatches(bJson.batches || []);
      }

      // 3. Students
      const sRes = await fetch('/api/admin/students', { headers });
      if (sRes.ok) {
        const sJson = await sRes.json();
        setStudents(sJson.registrations || []);
      }

      // 4. Settings
      const setRes = await fetch('/api/admin/settings', { headers });
      if (setRes.ok) {
        const setJson = await setRes.json();
        setSettings(setJson.settings);
      }

      // 5. Testimonials
      const tRes = await fetch('/api/admin/testimonials', { headers });
      if (tRes.ok) {
        const tJson = await tRes.json();
        setTestimonials(tJson.testimonials || []);
      }

      // 6. Speakers
      const spkRes = await fetch('/api/admin/speakers', { headers });
      if (spkRes.ok) {
        const spkJson = await spkRes.json();
        setSpeakers(spkJson.speakers || []);
      }

      // 7. Supabase Database Status
      const supaRes = await fetch('/api/admin/supabase/status', { headers });
      if (supaRes.ok) {
        const supaJson = await supaRes.json();
        setSupabaseStatus(supaJson);
      }

      // 8. Sent Acknowledgment Emails & Resources
      const emailRes = await fetch('/api/admin/emails', { headers });
      if (emailRes.ok) {
        const emailJson = await emailRes.json();
        setEmailsData(emailJson);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (registrationId: string) => {
    setResendingId(registrationId);
    try {
      const res = await fetch('/api/admin/emails/resend', {
        method: 'POST',
        headers,
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'Acknowledgment email resent successfully!');
        setTimeout(() => setActionMsg(null), 4000);
        const emailRes = await fetch('/api/admin/emails', { headers });
        if (emailRes.ok) {
          setEmailsData(await emailRes.json());
        }
      } else {
        setActionMsg(`Error: ${data.error || 'Failed to resend'}`);
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e: any) {
      setActionMsg(`Resend failed: ${e.message}`);
      setTimeout(() => setActionMsg(null), 4000);
    } finally {
      setResendingId(null);
    }
  };

  const handleFetchSupabaseStatus = async () => {
    setSupabaseLoading(true);
    try {
      const res = await fetch('/api/admin/supabase/status', { headers });
      if (res.ok) {
        const json = await res.json();
        setSupabaseStatus(json);
        setActionMsg('Supabase status refreshed.');
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const res = await fetch('/api/admin/supabase/sync', {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(data.message || 'Enrollments synced to Supabase successfully!');
        handleFetchSupabaseStatus();
      } else {
        setActionMsg(`Sync notice: ${data.result?.errors?.[0] || data.error || 'Check table schema'}`);
      }
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err: any) {
      setActionMsg(`Sync error: ${err.message}`);
      setTimeout(() => setActionMsg(null), 5000);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const handleFetchSupabaseEnrollments = async () => {
    setSupabaseLoading(true);
    try {
      const res = await fetch('/api/admin/supabase/enrollments', { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setSupabaseRecords(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleCopySql = () => {
    if (supabaseStatus?.sqlSetupScript) {
      navigator.clipboard.writeText(supabaseStatus.sqlSetupScript);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  // --- UPI Verification Handlers ---
  const handleApproveUpi = async (registrationId: string) => {
    setVerifyingId(registrationId);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/approve-upi`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(data.message || 'Payment verified & welcome email sent!');
        loadAllData();
      } else {
        setActionMsg(`Approval failed: ${data.error || 'Server error'}`);
      }
      setTimeout(() => setActionMsg(null), 5000);
    } catch (e: any) {
      setActionMsg(`Approval error: ${e.message}`);
      setTimeout(() => setActionMsg(null), 5000);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRejectUpi = async (registrationId: string) => {
    const reason = prompt('Enter rejection reason (or leave default):', 'Invalid 12-digit UTR. Payment could not be verified in ICICI bank records.');
    if (reason === null) return; // user cancelled prompt
    setVerifyingId(registrationId);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/reject-upi`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(data.message || 'Registration marked as rejected.');
        loadAllData();
      } else {
        setActionMsg(`Rejection failed: ${data.error || 'Server error'}`);
      }
      setTimeout(() => setActionMsg(null), 5000);
    } catch (e: any) {
      setActionMsg(`Rejection error: ${e.message}`);
      setTimeout(() => setActionMsg(null), 5000);
    } finally {
      setVerifyingId(null);
    }
  };

  // --- Batch Operations ---
  const handleOpenCreateBatch = () => {
    setEditingBatch(null);
    setBatchForm({
      batch_number: `Batch #${String(batches.length + 1).padStart(2, '0')}`,
      name: 'Upcoming Masterclass Cohort',
      start_date: '01 November 2026',
      end_date: '06 November 2026',
      registration_deadline: '31 October 2026, 11:59 PM',
      fee: 999,
      whatsapp_link: 'https://chat.whatsapp.com/sample-new-batch-link',
      max_seats: 100,
      status: 'upcoming',
      description: '6-Day Live Articleship Masterclass with mock interviews and mentor feedback.',
    });
    setBatchModalOpen(true);
  };

  const handleOpenEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setBatchForm({
      batch_number: batch.batch_number,
      name: batch.name,
      start_date: batch.start_date,
      end_date: batch.end_date,
      registration_deadline: batch.registration_deadline,
      fee: batch.fee,
      whatsapp_link: batch.whatsapp_link,
      max_seats: batch.max_seats,
      status: batch.status,
      description: batch.description,
    });
    setBatchModalOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBatch ? `/api/admin/batches/${editingBatch.id}` : '/api/admin/batches';
      const method = editingBatch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(batchForm),
      });

      if (res.ok) {
        setBatchModalOpen(false);
        setActionMsg(`Batch successfully ${editingBatch ? 'updated' : 'created'}!`);
        setTimeout(() => setActionMsg(null), 3000);
        loadAllData();
        if (onBatchesUpdated) onBatchesUpdated();
      }
    } catch (err) {
      console.error('Save batch error:', err);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setActionMsg('Batch deleted successfully.');
        setTimeout(() => setActionMsg(null), 3000);
        loadAllData();
        if (onBatchesUpdated) onBatchesUpdated();
      }
    } catch (err) {
      console.error('Delete batch error:', err);
    }
  };

  // --- Statistics Update ---
  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setActionMsg('Results & website settings updated successfully!');
        setTimeout(() => setActionMsg(null), 3000);
        if (onBatchesUpdated) onBatchesUpdated();
      }
    } catch (err) {
      console.error('Save settings error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-6xl w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              ☂
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                The Umbrella Network Admin Portal
              </h3>
              <p className="text-xs text-slate-500">
                Cohorts, WhatsApp Link Allocation & Student Registrations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Flash Message */}
        {actionMsg && (
          <div className="bg-emerald-50 text-emerald-800 px-6 py-2 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Content Area */}
        {!token ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md max-w-sm w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Admin Authentication</h4>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Enter your credentials to access batch management and student records.
              </p>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-1.5 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Default demo password: <code>admin123</code>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
                >
                  {loginLoading ? 'Signing In...' : 'Login to Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* LOGGED IN DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-3 flex md:flex-col gap-1 shrink-0 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'batches', label: 'Batch Management', icon: Calendar },
                { id: 'students', label: 'Student Registrations', icon: Users },
                { id: 'emails', label: 'Emails & Resources', icon: Mail },
                { id: 'supabase', label: 'Supabase Database', icon: Database },
                { id: 'stats', label: 'Results & Statistics', icon: Award },
                { id: 'speakers', label: 'Student Speakers', icon: Users },
                { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* 1. OVERVIEW */}
              {activeTab === 'overview' && overview && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-slate-900">Dashboard Metrics</h4>
                    <button
                      onClick={loadAllData}
                      className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* 4 Big Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
                      <div className="text-xs font-bold text-blue-700 uppercase">Total Registrations</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">
                        {overview.totalRegistrations}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Students successfully verified
                      </div>
                    </div>

                    <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-700 uppercase">Total Revenue</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">
                        ₹{overview.totalRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        From {overview.successfulPayments} paid seats
                      </div>
                    </div>

                    <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                      <div className="text-xs font-bold text-indigo-700 uppercase">Active Batch</div>
                      <div className="text-xl font-bold text-slate-900 mt-1 truncate">
                        {overview.currentBatch?.batch_number || 'None'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {overview.currentBatch?.seats_booked || 0} /{' '}
                        {overview.currentBatch?.max_seats || 100} seats filled
                      </div>
                    </div>

                    <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-100">
                      <div className="text-xs font-bold text-amber-700 uppercase">Conversion Rate</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">
                        {overview.conversionRate}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {overview.checkoutStarts} checkouts started
                      </div>
                    </div>
                  </div>

                  {/* Supabase Integration Banner in Overview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-blue-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Supabase Database Connected</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Project ID: <code className="font-mono text-emerald-800 font-bold">ohvjnllfxnalvtwzcxkm</code> • All student registrations auto-sync to your Supabase PostgreSQL tables.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      Manage Supabase Sync →
                    </button>
                  </div>

                  {/* Recent Registrations Table */}
                  <div className="mt-8">
                    <h5 className="font-bold text-slate-900 text-sm mb-3">Recent Registrations</h5>
                    {overview.recentRegistrations && overview.recentRegistrations.length > 0 ? (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Reg. No</th>
                              <th className="p-3">Student</th>
                              <th className="p-3">Phone</th>
                              <th className="p-3">Batch</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {overview.recentRegistrations.map((r: Registration) => (
                              <tr key={r.id} className="hover:bg-slate-50/80">
                                <td className="p-3 font-mono font-bold text-blue-700">
                                  {r.registration_number}
                                </td>
                                <td className="p-3 font-medium text-slate-900">
                                  {r.student_name}
                                  <span className="block text-[10px] text-slate-400">{r.student_email}</span>
                                </td>
                                <td className="p-3 text-slate-600">{r.student_phone}</td>
                                <td className="p-3 font-medium">{r.batch_number}</td>
                                <td className="p-3 font-bold text-emerald-700">₹{r.amount}</td>
                                <td className="p-3 text-slate-400">
                                  {new Date(r.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        No registrations recorded yet. Use the Join button on the website to test the flow.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. BATCH MANAGEMENT (Requirement 8, 22, 41) */}
              {activeTab === 'batches' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Recurring Batch Management</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure dates, seat limits, pricing, and batch-specific WhatsApp links without code changes.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateBatch}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Batch</span>
                    </button>
                  </div>

                  {/* Batches Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3.5">Batch</th>
                          <th className="p-3.5">Dates</th>
                          <th className="p-3.5">Seats</th>
                          <th className="p-3.5">Fee</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">WhatsApp Group Link</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {batches.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80">
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900">{b.batch_number}</span>
                              <span className="block text-[11px] text-slate-500">{b.name}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-medium text-slate-800">{b.start_date}</span>
                              <span className="block text-[10px] text-slate-400">to {b.end_date}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900">{b.seats_booked}</span>
                              <span className="text-slate-400"> / {b.max_seats}</span>
                            </td>
                            <td className="p-3.5 font-bold text-emerald-700">₹{b.fee}</td>
                            <td className="p-3.5">
                              <span
                                className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  b.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'upcoming'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3.5 max-w-[200px]">
                              <a
                                href={b.whatsapp_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 truncate text-[11px]"
                                title={b.whatsapp_link}
                              >
                                <Link className="w-3 h-3 shrink-0" />
                                <span className="truncate">{b.whatsapp_link}</span>
                              </a>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditBatch(b)}
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Batch"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBatch(b.id)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. STUDENT REGISTRATIONS */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Registered Students</h4>
                      <p className="text-xs text-slate-500">
                        Search candidates, verify UPI payments, filter by cohort, and export registration CSV.
                      </p>
                    </div>

                    <a
                      href="/api/admin/students/export-csv"
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </a>
                  </div>

                  {/* Pending UPI Verification Alert Banner */}
                  {students.filter(s => s.status === 'pending_verification').length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                          {students.filter(s => s.status === 'pending_verification').length}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>UPI Payments Awaiting Bank Verification</span>
                          </div>
                          <div className="text-[11px] text-amber-800 mt-0.5">
                            Check 12-digit UTR credits in your ICICI portal/app. Click <strong>Approve</strong> to release Drive links & dispatch student emails.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setStatusFilter(statusFilter === 'pending_verification' ? '' : 'pending_verification')}
                        className="px-3 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer text-center"
                      >
                        {statusFilter === 'pending_verification' ? 'Show All Registrations' : 'Filter Pending UPI'}
                      </button>
                    </div>
                  )}

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search student name, email, phone, or 12-digit UTR..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <select
                      value={selectedBatchFilter}
                      onChange={(e) => setSelectedBatchFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    >
                      <option value="">All Batches</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_number}
                        </option>
                      ))}
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending_verification">⏳ Pending Bank Verification</option>
                      <option value="verified">✓ Verified & Enrolled</option>
                      <option value="rejected">✕ Rejected</option>
                    </select>
                  </div>

                  {/* Student Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Reg ID</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Phone & Email</th>
                          <th className="p-3">CA Level</th>
                          <th className="p-3">Batch</th>
                          <th className="p-3">Fee / UTR</th>
                          <th className="p-3">Status & Action</th>
                          <th className="p-3">Registration Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students
                          .filter((s) => {
                            const q = studentSearch.toLowerCase();
                            const matchesQ =
                              !q ||
                              s.student_name.toLowerCase().includes(q) ||
                              s.student_email.toLowerCase().includes(q) ||
                              s.student_phone.includes(q) ||
                              s.registration_number.toLowerCase().includes(q) ||
                              (s.upi_utr && s.upi_utr.toLowerCase().includes(q));
                            const matchesB = !selectedBatchFilter || s.batch_id === selectedBatchFilter;
                            const matchesS = !statusFilter || (s.status || 'verified') === statusFilter;
                            return matchesQ && matchesB && matchesS;
                          })
                          .map((s) => {
                            const isPending = s.status === 'pending_verification';
                            const isRejected = s.status === 'rejected';
                            const isVerified = s.status === 'verified' || (!isPending && !isRejected);

                            return (
                              <tr key={s.id} className={`hover:bg-slate-50/80 ${isPending ? 'bg-amber-50/40' : ''}`}>
                                <td className="p-3 font-mono font-bold text-blue-700">
                                  {s.registration_number}
                                </td>
                                <td className="p-3 font-bold text-slate-900">{s.student_name}</td>
                                <td className="p-3 text-slate-600">
                                  <div>{s.student_phone}</div>
                                  <div className="text-[10px] text-slate-400">{s.student_email}</div>
                                </td>
                                <td className="p-3 text-slate-700">{s.ca_level}</td>
                                <td className="p-3 font-semibold text-blue-900">{s.batch_number}</td>
                                <td className="p-3">
                                  <div className="font-bold text-emerald-700">₹{s.amount}</div>
                                  {s.payment_method?.includes('UPI') || s.upi_utr ? (
                                    <div
                                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                        isPending ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-blue-800'
                                      }`}
                                      title={`UPI UTR: ${s.upi_utr || 'Direct'}`}
                                    >
                                      UTR: {s.upi_utr || 'Direct'}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400">Razorpay</div>
                                  )}
                                </td>
                                <td className="p-3">
                                  {isPending ? (
                                    <div className="space-y-1.5">
                                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                        <Clock className="w-2.5 h-2.5 text-amber-700" />
                                        Review Pending
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleApproveUpi(s.id)}
                                          disabled={verifyingId === s.id}
                                          title="Verify payment in ICICI bank records and send confirmation email with Google Drive + WhatsApp link"
                                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-2 py-1 rounded text-[10px] shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                                        >
                                          <UserCheck className="w-3 h-3" />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          onClick={() => handleRejectUpi(s.id)}
                                          disabled={verifyingId === s.id}
                                          title="Reject payment if UTR is not found in ICICI statements"
                                          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2 py-1 rounded text-[10px] cursor-pointer disabled:opacity-50 transition-all"
                                        >
                                          <UserX className="w-3 h-3" />
                                          <span>Reject</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : isVerified ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      Verified
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px] border border-rose-200"
                                      title={s.rejection_reason || 'UTR rejected'}
                                    >
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                      Rejected
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-400 whitespace-nowrap">
                                  {new Date(s.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. RESULTS & STATISTICS (Requirement 36) */}
              {activeTab === 'stats' && settings && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Results & Statistics</h4>
                      <p className="text-xs text-slate-500">
                        Update the 3 hero historical benchmarks displayed across the landing page.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="space-y-4">
                    {settings.statistics.map((stat, idx) => (
                      <div key={stat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="text-xs font-bold uppercase text-slate-500">
                          Statistic {idx + 1}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Number (e.g. 500+, 100%, 6 Days)
                            </label>
                            <input
                              type="text"
                              value={stat.number}
                              onChange={(e) => {
                                const copy = [...settings.statistics];
                                copy[idx].number = e.target.value;
                                setSettings({ ...settings, statistics: copy });
                              }}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={stat.title}
                              onChange={(e) => {
                                const copy = [...settings.statistics];
                                copy[idx].title = e.target.value;
                                setSettings({ ...settings, statistics: copy });
                              }}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={stat.description}
                            onChange={(e) => {
                              const copy = [...settings.statistics];
                              copy[idx].description = e.target.value;
                              setSettings({ ...settings, statistics: copy });
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. SPEAKERS & TESTIMONIALS */}
              {activeTab === 'speakers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Student Speakers (7 Verified)</h4>
                      <p className="text-xs text-slate-500">
                        Manage peer mentor profiles and upload photos directly from your computer.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {speakers.map((s) => (
                      <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                            <div className="text-xs text-blue-700 font-semibold">{s.firm} • {s.domain}</div>
                            {s.linkedin_url && (
                              <a href={s.linkedin_url} target="_blank" rel="noreferrer" className="text-[11px] text-slate-400 hover:text-blue-600 block mt-0.5">
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const base64 = event.target?.result as string;
                                  if (!base64) return;
                                  localStorage.setItem(`speaker_photo_${s.id}`, base64);
                                  setSpeakers(prev => prev.map(item => item.id === s.id ? { ...item, image: base64 } : item));
                                  try {
                                    const res = await fetch(`/api/speakers/${s.id}/photo`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ image: base64 }),
                                    });
                                    const data = await res.json();
                                    if (data.success && data.imageUrl) {
                                      setSpeakers(prev => prev.map(item => item.id === s.id ? { ...item, image: data.imageUrl } : item));
                                    }
                                    setActionMsg(`Updated photo for ${s.name}`);
                                    setTimeout(() => setActionMsg(null), 3000);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'testimonials' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-slate-900">Testimonial Management</h4>
                  <div className="space-y-3">
                    {testimonials.map((t) => (
                      <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-900 text-sm">{t.student_name} ({t.firm})</div>
                        <p className="text-xs text-slate-600 mt-1 italic">"{t.testimonial}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMAIL OUTBOX & GOOGLE DRIVE RESOURCES TAB */}
              {activeTab === 'emails' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-slate-900">Email Outbox & Masterclass Resources</h4>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Auto-Acknowledgment Active</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Every student who completes payment automatically receives a personalized thank-you acknowledgment email containing the Google Drive resources folder and their batch WhatsApp group link.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/admin/emails', { headers });
                          if (res.ok) setEmailsData(await res.json());
                          setActionMsg('Email log refreshed.');
                          setTimeout(() => setActionMsg(null), 3000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Log</span>
                      </button>
                    </div>
                  </div>

                  {/* Top Cards: Google Drive Resources + Service Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Google Drive Resources Link */}
                    <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-sm text-slate-900">Configured Masterclass Drive</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Shared on Payment
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        This Google Drive folder holds all masterclass materials (CV templates, cold email outreach scripts, domain guides, and Excel toolkits):
                      </p>

                      <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-[11px] font-mono text-slate-800 break-all select-all">
                        https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href="https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Drive Folder</span>
                        </a>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD');
                            setActionMsg('Google Drive link copied to clipboard!');
                            setTimeout(() => setActionMsg(null), 3000);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Email Dispatch Service */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-slate-700" />
                          <span className="font-bold text-sm text-slate-900">Email Delivery Service</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          emailsData?.status?.mode === 'smtp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {emailsData?.status?.mode === 'smtp' ? 'SMTP Connected' : 'Simulated Outbox'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Official Sender:</span>
                          <span className="font-semibold text-slate-800">caumbrellanetwork@gmail.com</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Sender Signature:</span>
                          <span className="font-semibold text-slate-800">CA Harsh Kaushik</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Total Emails Dispatched:</span>
                          <span className="font-bold text-blue-700">{emailsData?.total ?? 0}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Auto-Send on Payment:</span>
                          <span className="font-bold text-emerald-700">Enabled</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        {emailsData?.status?.mode === 'smtp'
                          ? 'Real emails are sent directly to students using your configured SMTP credentials.'
                          : 'Currently capturing emails to the persistent outbox log. To enable live SMTP delivery, supply SMTP_USER and SMTP_PASS in environment variables.'}
                      </p>
                    </div>
                  </div>

                  {/* Sent Acknowledgment Emails Outbox Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Dispatched Acknowledgment History</span>
                        <span className="text-xs font-normal text-slate-500">
                          ({emailsData?.emails?.length || 0} recorded)
                        </span>
                      </h5>
                    </div>

                    {(!emailsData?.emails || emailsData.emails.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">
                          No emails recorded in the outbox yet. As students register and payments are verified, their acknowledgment receipts and Google Drive links will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-3">Student & Email</th>
                              <th className="p-3">Batch & Reg ID</th>
                              <th className="p-3">Subject</th>
                              <th className="p-3">Sent At</th>
                              <th className="p-3">Delivery Mode</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {emailsData.emails.map((mail: any) => (
                              <tr key={mail.id} className="hover:bg-slate-50/80">
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{mail.studentName}</div>
                                  <div className="text-[11px] text-blue-600 font-mono">{mail.to}</div>
                                </td>
                                <td className="p-3">
                                  <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                                    {mail.batchNumber}
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {mail.registrationNumber}
                                  </div>
                                </td>
                                <td className="p-3 max-w-xs truncate" title={mail.subject}>
                                  {mail.subject}
                                </td>
                                <td className="p-3 text-[11px] whitespace-nowrap text-slate-500">
                                  {new Date(mail.sentAt).toLocaleString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="p-3">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    mail.mode === 'smtp'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {mail.mode}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      // Find corresponding registration by registrationNumber
                                      const reg = students.find(s => s.registration_number === mail.registrationNumber || s.id === mail.registrationNumber);
                                      if (reg) {
                                        handleResendEmail(reg.id);
                                      } else {
                                        handleResendEmail(mail.registrationNumber);
                                      }
                                    }}
                                    disabled={resendingId === mail.registrationNumber}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold cursor-pointer border border-blue-200"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>{resendingId === mail.registrationNumber ? 'Sending...' : 'Resend'}</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. SUPABASE DATABASE TAB */}
              {activeTab === 'supabase' && (
                <div className="space-y-6">
                  {/* Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-slate-900">Supabase Database Connection</h4>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        All student enrollment details and payment records are configured to store in your Supabase account.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFetchSupabaseStatus}
                        disabled={supabaseLoading}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseLoading ? 'animate-spin' : ''}`} />
                        <span>Test Connection</span>
                      </button>

                      <button
                        onClick={handleSyncSupabase}
                        disabled={supabaseSyncing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>{supabaseSyncing ? 'Syncing...' : 'Sync All Enrollments to Supabase'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Credentials & Configuration Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Project ID</div>
                      <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                        ohvjnllfxnalvtwzcxkm
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        ✓ Linked to Account
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Database Endpoint</div>
                      <div className="font-mono text-xs font-bold text-slate-900 mt-1 truncate">
                        https://ohvjnllfxnalvtwzcxkm.supabase.co
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        PostgREST API v1 Active
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Table</div>
                      <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                        public.enrollments
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Auto-saves upon registration
                      </div>
                    </div>
                  </div>

                  {/* Supabase Status Diagnostic */}
                  {supabaseStatus && (
                    <div className={`p-4 rounded-2xl border ${
                      supabaseStatus.status?.tablesFound?.enrollments || supabaseStatus.status?.tablesFound?.registrations
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-sm">
                              {supabaseStatus.status?.tablesFound?.enrollments || supabaseStatus.status?.tablesFound?.registrations
                                ? 'Supabase Table Ready'
                                : 'One-Time Step: Create Enrollments Table in Supabase'}
                            </div>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">
                              {supabaseStatus.status?.details}
                            </p>
                          </div>
                        </div>
                        <a
                          href="https://supabase.com/dashboard/project/ohvjnllfxnalvtwzcxkm/sql"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white text-slate-800 hover:text-blue-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                        >
                          <span>Open Supabase SQL Editor</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* SQL Setup Script */}
                  <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="font-bold text-white text-sm">SQL Schema for Supabase</div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Run this script in your Supabase SQL Editor to initialize the enrollments table with public write permission.
                        </p>
                      </div>
                      <button
                        onClick={handleCopySql}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{sqlCopied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                      </button>
                    </div>

                    <pre className="mt-4 p-3 bg-slate-950 rounded-xl text-xs font-mono overflow-x-auto text-emerald-400 max-h-56 leading-relaxed">
                      {supabaseStatus?.sqlSetupScript || `-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    registration_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    ca_level TEXT,
    attempt_details TEXT,
    batch_id TEXT,
    batch_number TEXT,
    batch_name TEXT,
    batch_date TEXT,
    amount NUMERIC DEFAULT 999,
    payment_id TEXT,
    order_id TEXT,
    payment_status TEXT DEFAULT 'successful',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow read" ON public.enrollments FOR SELECT TO anon, authenticated USING (true);`}
                    </pre>
                  </div>

                  {/* Data Synchronization & Live Viewer */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">Local vs Supabase Records</h5>
                        <p className="text-xs text-slate-500">
                          Total student registrations on website: <strong className="text-slate-900">{students.length}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleFetchSupabaseEnrollments}
                          disabled={supabaseLoading}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Fetch Records from Supabase</span>
                        </button>
                      </div>
                    </div>

                    {supabaseRecords.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Reg #</th>
                              <th className="p-2.5">Student</th>
                              <th className="p-2.5">Batch</th>
                              <th className="p-2.5">Amount</th>
                              <th className="p-2.5">Saved At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {supabaseRecords.map((rec: any) => (
                              <tr key={rec.id} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-blue-700">{rec.registration_number}</td>
                                <td className="p-2.5 font-medium text-slate-900">{rec.student_name}</td>
                                <td className="p-2.5">{rec.batch_number}</td>
                                <td className="p-2.5 font-bold">₹{rec.amount}</td>
                                <td className="p-2.5 text-slate-500">{new Date(rec.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                        <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">
                          Click "Sync All Enrollments to Supabase" to push your registered students directly to Supabase.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT BATCH MODAL */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h4 className="text-lg font-bold text-slate-900">
                {editingBatch ? `Edit ${editingBatch.batch_number}` : 'Create New Masterclass Batch'}
              </h4>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.batch_number}
                    onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                    placeholder="e.g. Batch #08"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={batchForm.status}
                    onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    <option value="active">Active (Enroll Now)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Name / Title *</label>
                <input
                  type="text"
                  required
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  placeholder="e.g. October 2026 Masterclass Cohort"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.start_date}
                    onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                    placeholder="e.g. 15 October 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.end_date}
                    onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                    placeholder="e.g. 20 October 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={batchForm.fee}
                    onChange={(e) => setBatchForm({ ...batchForm, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seat Limit</label>
                  <input
                    type="number"
                    value={batchForm.max_seats}
                    onChange={(e) => setBatchForm({ ...batchForm, max_seats: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* CRITICAL BATCH-SPECIFIC WHATSAPP LINK */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <label className="block font-bold text-emerald-900 mb-1">
                  Batch-Dedicated WhatsApp Group Link *
                </label>
                <input
                  type="url"
                  required
                  value={batchForm.whatsapp_link}
                  onChange={(e) => setBatchForm({ ...batchForm, whatsapp_link: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-sm bg-white font-mono"
                />
                <p className="text-[10px] text-emerald-700 mt-1">
                  * This link is strictly private and will only be shown to students who successfully
                  register and pay for this specific batch.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={batchForm.description}
                  onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
