import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  CheckCheck, 
  XCircle, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  User,
  AlertCircle,
  HelpCircle,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import TrackingTimeline from '../components/TrackingTimeline';

export default function ResidentDashboard({ setView, defaultDocumentTypeId }) {
  const { user, updateUserProfile } = useAuth();
  
  // Data state
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    completedRequests: 0,
  });
  const [requests, setRequests] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active items for modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // New Request Form state
  const [newForm, setNewForm] = useState({
    document_type_id: defaultDocumentTypeId || '',
    purpose: '',
    full_name: user?.full_name || '',
    address: user?.address || '',
    contact_number: user?.contact_number || '',
  });

  // Edit Request Form state
  const [editForm, setEditForm] = useState({
    document_type_id: '',
    purpose: '',
    full_name: '',
    address: '',
    contact_number: '',
  });

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    address: user?.address || '',
    contact_number: user?.contact_number || '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes, docsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRequests(),
        api.getDocumentTypes(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (reqsRes.success) setRequests(reqsRes.data);
      if (docsRes.success) {
        setDocTypes(docsRes.data);
        if (!newForm.document_type_id && docsRes.data.length > 0) {
          setNewForm(prev => ({ ...prev, document_type_id: docsRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load resident dashboard data:', err);
      showToast('Could not load records from backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update newForm defaults if user loads late
  useEffect(() => {
    if (user) {
      setNewForm(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        address: prev.address || user.address || '',
        contact_number: prev.contact_number || user.contact_number || '',
      }));
      setProfileForm({
        full_name: user.full_name || '',
        address: user.address || '',
        contact_number: user.contact_number || '',
      });
    }
  }, [user]);

  // Handle New Request Submit
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newForm.document_type_id || !newForm.purpose.trim() || !newForm.full_name.trim() || !newForm.address.trim() || !newForm.contact_number.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.createRequest({
        document_type_id: parseInt(newForm.document_type_id, 10),
        purpose: newForm.purpose,
        full_name: newForm.full_name,
        address: newForm.address,
        contact_number: newForm.contact_number,
      });

      if (res.success) {
        showToast(res.message || 'Document request submitted successfully!');
        setIsNewModalOpen(false);
        setNewForm(prev => ({ ...prev, purpose: '' }));
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit document request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (req) => {
    if (req.status !== 'Pending') {
      showToast(`Cannot edit request with status '${req.status}'. Only Pending requests can be edited.`, 'error');
      return;
    }
    setSelectedRequest(req);
    setEditForm({
      document_type_id: req.document_type_id,
      purpose: req.purpose,
      full_name: req.full_name,
      address: req.address,
      contact_number: req.contact_number,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setFormSubmitting(true);
      const res = await api.updateRequest(selectedRequest.id, {
        document_type_id: parseInt(editForm.document_type_id, 10),
        purpose: editForm.purpose,
        full_name: editForm.full_name,
        address: editForm.address,
        contact_number: editForm.contact_number,
      });

      if (res.success) {
        showToast('Request details updated successfully!');
        setIsEditModalOpen(false);
        setSelectedRequest(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Cancel/Delete Confirm Modal
  const promptCancelRequest = (req) => {
    if (req.status !== 'Pending') {
      showToast(`Only Pending requests can be cancelled.`, 'error');
      return;
    }
    setSelectedRequest(req);
    setIsCancelConfirmOpen(true);
  };

  // Handle Cancel/Delete
  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;
    try {
      setFormSubmitting(true);
      const res = await api.deleteRequest(selectedRequest.id);
      if (res.success) {
        showToast(res.message || 'Request cancelled and removed.');
        setIsCancelConfirmOpen(false);
        setSelectedRequest(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel request.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Tracking View
  const openTrackingModal = async (req) => {
    try {
      const res = await api.getRequestById(req.id);
      if (res.success) {
        setSelectedRequest(res.data);
        setIsTrackingModalOpen(true);
      }
    } catch (err) {
      showToast('Could not fetch tracking details.', 'error');
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      const res = await api.updateUser(user.id, profileForm);
      if (res.success) {
        updateUserProfile(res.data);
        showToast('Profile information updated successfully!');
        setIsProfileModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtering
  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch = 
      r.document_name.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 text-sm transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-tinurik-blue text-xs font-bold uppercase tracking-wider">
              Resident Dashboard
            </span>
            <span className="text-xs text-slate-400">• Verified Resident</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, {user?.full_name || 'Resident'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 pt-0.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            {user?.address || 'Barangay Tinurik, Tanauan City'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <User className="w-4 h-4 text-slate-500" />
            Edit Profile
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-tinurik-blue hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-900/20 transition-all hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4" />
            New Document Request
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.totalRequests}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{stats.pendingRequests}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Requests */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Approved</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{stats.approvedRequests}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Requests */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.completedRequests}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Requests Management Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">My Document Requests</h3>
            <p className="text-xs text-slate-500">Track and manage your submitted certificate requests</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {['ALL', 'Pending', 'Approved', 'Completed', 'Rejected'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filterStatus === statusKey
                  ? 'bg-tinurik-blue text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {statusKey === 'ALL' ? 'All Requests' : statusKey}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-2 border-tinurik-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading your requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No document requests found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || filterStatus !== 'ALL'
                  ? 'No requests match your selected filters. Try clearing the search or status filter.'
                  : "You haven't submitted any document requests yet. Click the button below to get started!"}
              </p>
              {!search && filterStatus === 'ALL' && (
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="px-4 py-2 bg-tinurik-blue text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Submit First Request
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-6">Tracking Ref</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Purpose</th>
                  <th className="py-3.5 px-6">Date Submitted</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{req.id}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 block text-sm">{req.document_name}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-600" title={req.purpose}>
                      {req.purpose}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Tracking / History */}
                        <button
                          onClick={() => openTrackingModal(req)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-tinurik-blue rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title="Track Request Status & Timeline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Track
                        </button>

                        {/* Edit Button (Only for Pending) */}
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => openEditModal(req)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Pending Request"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancel / Delete (Only for Pending) */}
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => promptCancelRequest(req)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: Submit New Request */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit New Document Request"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newForm.document_type_id}
              onChange={(e) => setNewForm({ ...newForm, document_type_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Choose document --</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.document_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Applicant Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newForm.full_name}
              onChange={(e) => setNewForm({ ...newForm, full_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
              placeholder="Full legal name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={newForm.contact_number}
                onChange={(e) => setNewForm({ ...newForm, contact_number: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                placeholder="0917-000-0000"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Barangay Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newForm.address}
                onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                placeholder="Purok / Street"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose of Request <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={newForm.purpose}
              onChange={(e) => setNewForm({ ...newForm, purpose: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              placeholder="e.g. Pre-employment requirement, Passport application, School scholarship, Bank account..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Provide a clear and specific purpose to help the barangay secretary evaluate your application quickly.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-lg bg-tinurik-blue hover:bg-blue-800 text-white font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {formSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Pending Request */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Pending Request #${selectedRequest?.id}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              value={editForm.document_type_id}
              onChange={(e) => setEditForm({ ...editForm, document_type_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            >
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.document_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Applicant Name
            </label>
            <input
              type="text"
              required
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                required
                value={editForm.contact_number}
                onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                required
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose of Request
            </label>
            <textarea
              required
              rows={3}
              value={editForm.purpose}
              onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-lg bg-tinurik-blue hover:bg-blue-800 text-white font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Request Tracking & Timeline */}
      <Modal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        title="Live Request Tracking"
        maxWidth="max-w-2xl"
      >
        <TrackingTimeline request={selectedRequest} />
      </Modal>

      {/* MODAL: Cancel Request Confirmation */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Document Request"
        message={`Are you sure you want to cancel and delete request #${selectedRequest?.id} for ${selectedRequest?.document_name}? This action cannot be undone.`}
        confirmText="Yes, Cancel Request"
        isDanger={true}
        isLoading={formSubmitting}
      />

      {/* MODAL: Edit Profile */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Update Resident Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Complete Name
            </label>
            <input
              type="text"
              required
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              required
              value={profileForm.contact_number}
              onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Barangay Tinurik Address
            </label>
            <textarea
              required
              rows={2}
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-lg bg-tinurik-blue hover:bg-blue-800 text-white font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {formSubmitting ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
