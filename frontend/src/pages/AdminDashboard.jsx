import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CheckCheck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  UserX, 
  UserCheck,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, API_BASE_URL } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import TrackingTimeline from '../components/TrackingTimeline';

export default function AdminDashboard({ setView }) {
  const { user, logout } = useAuth();

  // Active admin tab: 'overview' | 'requests' | 'doctypes' | 'residents' | 'system'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    completedRequests: 0,
    activeDocumentTypes: 0,
    recentRequests: []
  });
  const [requests, setRequests] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [residents, setResidents] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [reqStatusFilter, setReqStatusFilter] = useState('ALL');
  const [reqDocTypeFilter, setReqDocTypeFilter] = useState('ALL');
  const [reqSearch, setReqSearch] = useState('');
  const [residentSearch, setResidentSearch] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Action Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');

  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [completeRemarks, setCompleteRemarks] = useState('');

  const [isDeleteReqConfirmOpen, setIsDeleteReqConfirmOpen] = useState(false);

  // Document Types Modals
  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);
  const [isDocTypeEdit, setIsDocTypeEdit] = useState(false);
  const [docTypeForm, setDocTypeForm] = useState({
    document_name: '',
    description: '',
    is_active: true
  });
  const [isDeleteDocTypeConfirmOpen, setIsDeleteDocTypeConfirmOpen] = useState(false);

  // Resident Modals
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [residentForm, setResidentForm] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    address: ''
  });
  const [isResidentStatusConfirmOpen, setIsResidentStatusConfirmOpen] = useState(false);
  const [targetResidentStatus, setTargetResidentStatus] = useState(false);

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes, docsRes, usersRes, healthRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRequests(),
        api.getDocumentTypes(true),
        api.getUsers(),
        api.getHealth().catch(() => ({ status: 'UNREACHABLE' }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (reqsRes.success) setRequests(reqsRes.data);
      if (docsRes.success) setDocTypes(docsRes.data);
      if (usersRes.success) setResidents(usersRes.data);
      if (healthRes.status) setSystemHealth(healthRes);
    } catch (err) {
      console.error('Admin fetch error:', err);
      showToast('Error syncing administrative data with Backend API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- REQUEST ACTIONS ---

  const openTracking = async (req) => {
    try {
      const res = await api.getRequestById(req.id);
      if (res.success) {
        setSelectedRequest(res.data);
        setIsTrackingModalOpen(true);
      }
    } catch (err) {
      showToast('Could not fetch request details.', 'error');
    }
  };

  const promptApprove = (req) => {
    setSelectedRequest(req);
    setApproveRemarks('Verified and approved for document processing.');
    setIsApproveConfirmOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setFormSubmitting(true);
      const res = await api.updateRequestStatus(selectedRequest.id, {
        status: 'Approved',
        remarks: approveRemarks || 'Requirements verified and approved by admin.'
      });
      if (res.success) {
        showToast(`Request #${selectedRequest.id} successfully APPROVED.`);
        setIsApproveConfirmOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const promptReject = (req) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      showToast('Rejection reason is mandatory.', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.updateRequestStatus(selectedRequest.id, {
        status: 'Rejected',
        rejection_reason: rejectionReason.trim(),
        remarks: `Rejected by admin: ${rejectionReason.trim()}`
      });
      if (res.success) {
        showToast(`Request #${selectedRequest.id} marked REJECTED.`);
        setIsRejectModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const promptComplete = (req) => {
    setSelectedRequest(req);
    setCompleteRemarks('Official document issued to resident at Barangay Hall.');
    setIsCompleteConfirmOpen(true);
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;
    try {
      setFormSubmitting(true);
      const res = await api.updateRequestStatus(selectedRequest.id, {
        status: 'Completed',
        remarks: completeRemarks || 'Document printed, stamped, and issued.'
      });
      if (res.success) {
        showToast(`Request #${selectedRequest.id} marked as COMPLETED.`);
        setIsCompleteConfirmOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to mark as completed.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const promptDeleteRequest = (req) => {
    setSelectedRequest(req);
    setIsDeleteReqConfirmOpen(true);
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    try {
      setFormSubmitting(true);
      const res = await api.deleteRequest(selectedRequest.id);
      if (res.success) {
        showToast(res.message || `Request #${selectedRequest.id} deleted.`);
        setIsDeleteReqConfirmOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- DOCUMENT TYPES ACTIONS ---

  const openNewDocTypeModal = () => {
    setIsDocTypeEdit(false);
    setDocTypeForm({
      document_name: '',
      description: '',
      is_active: true
    });
    setIsDocTypeModalOpen(true);
  };

  const openEditDocTypeModal = (doc) => {
    setIsDocTypeEdit(true);
    setSelectedDocType(doc);
    setDocTypeForm({
      document_name: doc.document_name,
      description: doc.description || '',
      is_active: doc.is_active
    });
    setIsDocTypeModalOpen(true);
  };

  const handleSaveDocType = async (e) => {
    e.preventDefault();
    if (!docTypeForm.document_name.trim()) {
      showToast('Document name is required.', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      if (isDocTypeEdit && selectedDocType) {
        const res = await api.updateDocumentType(selectedDocType.id, docTypeForm);
        if (res.success) {
          showToast('Document type updated successfully.');
          setIsDocTypeModalOpen(false);
          fetchAllData();
        }
      } else {
        const res = await api.createDocumentType(docTypeForm);
        if (res.success) {
          showToast('New document type added.');
          setIsDocTypeModalOpen(false);
          fetchAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save document type.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const promptDeleteDocType = (doc) => {
    setSelectedDocType(doc);
    setIsDeleteDocTypeConfirmOpen(true);
  };

  const handleDeleteDocType = async () => {
    if (!selectedDocType) return;
    try {
      setFormSubmitting(true);
      const res = await api.deleteDocumentType(selectedDocType.id);
      if (res.success) {
        showToast(res.message || 'Document type deleted or deactivated.');
        setIsDeleteDocTypeConfirmOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete document type.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- RESIDENTS ACTIONS ---

  const openEditResidentModal = (resUser) => {
    setSelectedResident(resUser);
    setResidentForm({
      full_name: resUser.full_name,
      email: resUser.email,
      contact_number: resUser.contact_number,
      address: resUser.address
    });
    setIsResidentModalOpen(true);
  };

  const handleSaveResident = async (e) => {
    e.preventDefault();
    if (!selectedResident) return;

    try {
      setFormSubmitting(true);
      const res = await api.updateUser(selectedResident.id, residentForm);
      if (res.success) {
        showToast('Resident details updated.');
        setIsResidentModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resident.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const promptToggleResidentStatus = (resUser) => {
    // Check self-deactivation guard
    if (resUser.id === user.id && resUser.is_active) {
      showToast('Action blocked: You cannot deactivate your own administrative account.', 'error');
      return;
    }
    setSelectedResident(resUser);
    setTargetResidentStatus(!resUser.is_active);
    setIsResidentStatusConfirmOpen(true);
  };

  const handleToggleResidentStatus = async () => {
    if (!selectedResident) return;
    try {
      setFormSubmitting(true);
      const res = await api.updateUserStatus(selectedResident.id, { is_active: targetResidentStatus });
      if (res.success) {
        showToast(res.message || 'Resident status updated.');
        setIsResidentStatusConfirmOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resident status.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered lists
  const filteredRequests = requests.filter(r => {
    const matchesStatus = reqStatusFilter === 'ALL' || r.status === reqStatusFilter;
    const matchesDocType = reqDocTypeFilter === 'ALL' || String(r.document_type_id) === String(reqDocTypeFilter);
    const matchesSearch = 
      r.full_name.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.purpose.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.document_name.toLowerCase().includes(reqSearch.toLowerCase()) ||
      String(r.id).includes(reqSearch);
    return matchesStatus && matchesDocType && matchesSearch;
  });

  const filteredResidents = residents.filter(r => 
    r.full_name.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.email.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.contact_number.includes(residentSearch) ||
    r.address.toLowerCase().includes(residentSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 text-sm transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">• Barangay Secretary & Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Barangay Tinurik Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Process document requests, manage resident records, and monitor AWS server health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setView('home')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold shadow-2xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-tinurik-blue text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-tinurik-blue text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Requests ({requests.length})
          {stats.pendingRequests > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
              {stats.pendingRequests}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('doctypes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'doctypes'
              ? 'bg-tinurik-blue text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Document Types ({docTypes.length})
        </button>

        <button
          onClick={() => setActiveTab('residents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'residents'
              ? 'bg-tinurik-blue text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Residents ({residents.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & STATS                                  */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Residents
              </span>
              <div className="text-2xl font-black text-slate-900">{stats.totalResidents}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Registered in Tinurik</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Requests
              </span>
              <div className="text-2xl font-black text-slate-900">{stats.totalRequests}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Lifetime Submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Pending Review
              </span>
              <div className="text-2xl font-black text-amber-600">{stats.pendingRequests}</div>
              <span className="text-[10px] text-amber-600/80 mt-1 block font-semibold">Requires action</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Approved
              </span>
              <div className="text-2xl font-black text-blue-600">{stats.approvedRequests}</div>
              <span className="text-[10px] text-blue-600/80 mt-1 block">Ready for printing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Completed
              </span>
              <div className="text-2xl font-black text-emerald-600">{stats.completedRequests}</div>
              <span className="text-[10px] text-emerald-600/80 mt-1 block">Issued & Released</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                Rejected
              </span>
              <div className="text-2xl font-black text-rose-600">{stats.rejectedRequests}</div>
              <span className="text-[10px] text-rose-600/80 mt-1 block">Declined with reason</span>
            </div>

          </div>

          {/* Quick Action & Recent Submissions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Requests Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Recent Document Submissions</h3>
                  <p className="text-xs text-slate-500">Latest requests submitted by residents</p>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-bold text-tinurik-blue hover:underline flex items-center gap-1"
                >
                  View All Requests <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {stats.recentRequests && stats.recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentRequests.map((r) => (
                    <div 
                      key={r.id} 
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">#{r.id}</span>
                          <span className="font-bold text-slate-800">{r.document_name}</span>
                        </div>
                        <span className="text-slate-500 block mt-0.5">Resident: {r.full_name}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-md">"{r.purpose}"</span>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={r.status} size="sm" />
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">No recent requests recorded.</p>
              )}
            </div>

            {/* Quick Administrative Controls */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                  Quick Actions
                </h4>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => { setActiveTab('requests'); setReqStatusFilter('Pending'); }}
                    className="w-full p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Review Pending Requests ({stats.pendingRequests})
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('doctypes'); openNewDocTypeModal(); }}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-tinurik-blue" />
                      Create New Document Type
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('residents')}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      Browse Resident Directory
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Portal System Status */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Portal System Status
                  </span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">System Mode:</span>
                    <span className="font-semibold text-emerald-400">Online & Active</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Security:</span>
                    <span className="font-semibold text-sky-300">Encrypted JWT Session</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold">Tinurik, Tanauan City</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DOCUMENT REQUESTS MANAGEMENT                      */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          
          {/* Header & Search */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Document Request Processing</h3>
              <p className="text-xs text-slate-500">Approve, reject, edit, or complete resident applications</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search resident, purpose, ID..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Document Type Dropdown */}
              <select
                value={reqDocTypeFilter}
                onChange={(e) => setReqDocTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">All Document Types</option>
                {docTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>{dt.document_name}</option>
                ))}
              </select>

              {/* Refresh */}
              <button
                onClick={fetchAllData}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh Records"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Status Filter Bar */}
          <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 border-y border-slate-200 text-xs overflow-x-auto">
            {['ALL', 'Pending', 'Approved', 'Completed', 'Rejected'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setReqStatusFilter(statusKey)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  reqStatusFilter === statusKey
                    ? 'bg-tinurik-blue text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {statusKey === 'ALL' ? `All Requests (${requests.length})` : statusKey}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No document requests found matching the current filters.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-5">Resident Name</th>
                    <th className="py-3 px-5">Document</th>
                    <th className="py-3 px-5">Purpose</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        #{req.id}
                      </td>
                      <td className="py-3.5 px-5">
                        <strong className="text-slate-900 block">{req.full_name}</strong>
                        <span className="text-[11px] text-slate-400 block">{req.contact_number}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {req.document_name}
                      </td>
                      <td className="py-3.5 px-5 max-w-xs truncate text-slate-600" title={req.purpose}>
                        {req.purpose}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Track / Details */}
                          <button
                            onClick={() => openTracking(req)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Status History & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve (For Pending) */}
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => promptApprove(req)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                              title="Approve Request"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}

                          {/* Reject (For Pending) */}
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => promptReject(req)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                              title="Reject Request with Reason"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )}

                          {/* Complete (For Approved) */}
                          {req.status === 'Approved' && (
                            <button
                              onClick={() => promptComplete(req)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                              title="Mark as Completed / Issued"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Complete
                            </button>
                          )}

                          {/* Delete invalid/duplicate */}
                          <button
                            onClick={() => promptDeleteRequest(req)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DOCUMENT TYPES MANAGEMENT                         */}
      {/* ======================================================== */}
      {activeTab === 'doctypes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Manage Document Types</h3>
              <p className="text-xs text-slate-500">Add, edit, or deactivate document clearance types issued by Tinurik</p>
            </div>

            <button
              onClick={openNewDocTypeModal}
              className="px-4 py-2 bg-tinurik-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Document Type
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Document Name</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docTypes.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{doc.id}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                      {doc.document_name}
                    </td>
                    <td className="py-4 px-6 max-w-md text-slate-600 leading-relaxed">
                      {doc.description || 'No description provided.'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        doc.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDocTypeModal(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Document Type"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => promptDeleteDocType(doc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete / Deactivate Document Type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RESIDENTS MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeTab === 'residents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Registered Residents Directory</h3>
              <p className="text-xs text-slate-500">View resident accounts, total request counts, and manage access</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Resident Name</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Contact Number</th>
                  <th className="py-3 px-6">Barangay Address</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidents.map((resUser) => (
                  <tr key={resUser.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{resUser.id}
                    </td>
                    <td className="py-4 px-6">
                      <strong className="text-slate-900 block text-sm">{resUser.full_name}</strong>
                      <span className="text-[11px] text-slate-400">Total Requests: {resUser.total_requests || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">
                      {resUser.email}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {resUser.contact_number}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-600" title={resUser.address}>
                      {resUser.address}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        resUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {resUser.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        resUser.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {resUser.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Edit details */}
                        <button
                          onClick={() => openEditResidentModal(resUser)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Resident Info"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Toggle active / deactivated (with self-deactivation guard) */}
                        {resUser.id !== user.id ? (
                          <button
                            onClick={() => promptToggleResidentStatus(resUser)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              resUser.is_active 
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={resUser.is_active ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {resUser.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic px-1">Current User</span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* MODAL: Request Tracking / Timeline */}
      <Modal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        title="Request Tracking & Audit Log"
        maxWidth="max-w-2xl"
      >
        <TrackingTimeline request={selectedRequest} />
      </Modal>

      {/* MODAL: Reject Request (MANDATORY REASON) */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Document Request #${selectedRequest?.id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <span className="font-bold block">Notice:</span>
            A valid rejection reason is mandatory and will be visible to resident <strong>{selectedRequest?.full_name}</strong> on their tracking dashboard.
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete residency records, unverified address, duplicate pending request..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting || !rejectionReason.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {formSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Approve Request Confirmation */}
      <ConfirmModal
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleApprove}
        title="Approve Document Request"
        message={`Approve document request #${selectedRequest?.id} for resident ${selectedRequest?.full_name}? The resident will be notified that their document is being processed.`}
        confirmText="Approve Request"
        isLoading={formSubmitting}
      />

      {/* MODAL: Complete Request Confirmation */}
      <ConfirmModal
        isOpen={isCompleteConfirmOpen}
        onClose={() => setIsCompleteConfirmOpen(false)}
        onConfirm={handleComplete}
        title="Mark Request as Completed"
        message={`Mark request #${selectedRequest?.id} as Completed? This confirms that the official certificate has been signed, stamped, and issued.`}
        confirmText="Mark as Completed"
        isLoading={formSubmitting}
      />

      {/* MODAL: Delete Request Confirmation */}
      <ConfirmModal
        isOpen={isDeleteReqConfirmOpen}
        onClose={() => setIsDeleteReqConfirmOpen(false)}
        onConfirm={handleDeleteRequest}
        title="Delete Document Request"
        message={`Are you sure you want to permanently delete request #${selectedRequest?.id}? This action will remove the request and its history.`}
        confirmText="Delete Permanently"
        isDanger={true}
        isLoading={formSubmitting}
      />

      {/* MODAL: Create / Edit Document Type */}
      <Modal
        isOpen={isDocTypeModalOpen}
        onClose={() => setIsDocTypeModalOpen(false)}
        title={isDocTypeEdit ? `Edit Document Type: ${selectedDocType?.document_name}` : 'Create New Document Type'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDocType} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={docTypeForm.document_name}
              onChange={(e) => setDocTypeForm({ ...docTypeForm, document_name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              placeholder="e.g. Barangay Clearance"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              value={docTypeForm.description}
              onChange={(e) => setDocTypeForm({ ...docTypeForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              placeholder="Explain the document purpose and requirements..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={docTypeForm.is_active}
              onChange={(e) => setDocTypeForm({ ...docTypeForm, is_active: e.target.checked })}
              className="w-4 h-4 text-tinurik-blue rounded border-slate-300"
            />
            <label htmlFor="is_active_checkbox" className="font-semibold text-slate-700 cursor-pointer">
              Active (Available for resident requests)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDocTypeModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-tinurik-blue hover:bg-blue-800 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Save Document Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Document Type Confirmation */}
      <ConfirmModal
        isOpen={isDeleteDocTypeConfirmOpen}
        onClose={() => setIsDeleteDocTypeConfirmOpen(false)}
        onConfirm={handleDeleteDocType}
        title="Delete or Deactivate Document Type"
        message={`Are you sure you want to delete '${selectedDocType?.document_name}'? If existing resident requests reference this type, it will be deactivated instead to safeguard historical integrity.`}
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={formSubmitting}
      />

      {/* MODAL: Edit Resident Info */}
      <Modal
        isOpen={isResidentModalOpen}
        onClose={() => setIsResidentModalOpen(false)}
        title={`Edit Resident: ${selectedResident?.full_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveResident} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={residentForm.full_name}
              onChange={(e) => setResidentForm({ ...residentForm, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={residentForm.email}
              onChange={(e) => setResidentForm({ ...residentForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              required
              value={residentForm.contact_number}
              onChange={(e) => setResidentForm({ ...residentForm, contact_number: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address
            </label>
            <textarea
              rows={2}
              required
              value={residentForm.address}
              onChange={(e) => setResidentForm({ ...residentForm, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsResidentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-tinurik-blue hover:bg-blue-800 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {formSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Toggle Resident Status Confirmation */}
      <ConfirmModal
        isOpen={isResidentStatusConfirmOpen}
        onClose={() => setIsResidentStatusConfirmOpen(false)}
        onConfirm={handleToggleResidentStatus}
        title={targetResidentStatus ? 'Activate Resident Account' : 'Deactivate Resident Account'}
        message={
          targetResidentStatus
            ? `Re-activate access for resident ${selectedResident?.full_name}? They will be able to log in and submit requests.`
            : `Are you sure you want to deactivate ${selectedResident?.full_name}? Deactivated residents will be prevented from logging into the portal.`
        }
        confirmText={targetResidentStatus ? 'Activate Account' : 'Deactivate Account'}
        isDanger={!targetResidentStatus}
        isLoading={formSubmitting}
      />

    </div>
  );
}
