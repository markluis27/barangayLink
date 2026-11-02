import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Documents({ setView, onSelectDocument }) {
  const { user } = useAuth();
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTypes() {
      try {
        setLoading(true);
        const res = await api.getDocumentTypes();
        if (res.success && Array.isArray(res.data)) {
          setDocTypes(res.data);
        }
      } catch (err) {
        console.error('Failed to load document types:', err);
        setError('Failed to load document types from Backend API. Please verify backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchTypes();
  }, []);

  const handleRequestClick = (doc) => {
    if (!user) {
      setView('login');
    } else {
      if (onSelectDocument) {
        onSelectDocument(doc.id);
      }
      setView('resident-dashboard');
    }
  };

  const filteredDocs = docTypes.filter(doc => 
    doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-tinurik-blue text-xs font-bold">
          <FileText className="w-4 h-4" />
          <span>Official Barangay Certifications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Available Documents & Clearances
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Review the list of certificates, clearances, and IDs issued by Barangay Tinurik. Submit your application online for faster processing.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document type by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-tinurik-blue/20 focus:border-tinurik-blue shadow-xs"
          />
        </div>
      </div>

      {/* Error Callout if Backend Offline */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-10 bg-slate-200 rounded-lg pt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-tinurik-blue flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{doc.document_name}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {doc.description || 'Official barangay certification verified and signed by authorized officials.'}
                </p>

                {/* Requirements / Details Pill */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600 mb-6">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Requirements:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                    <li>Valid Government ID or Student ID</li>
                    <li>Proof of Residency within Tinurik</li>
                    <li>Stated valid purpose of request</li>
                  </ul>
                  <div className="flex items-center gap-1.5 text-slate-500 pt-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Turnaround: 1 to 2 business days</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleRequestClick(doc)}
                  className="w-full py-2.5 px-4 rounded-xl bg-tinurik-blue hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Request {doc.document_name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 text-xs leading-relaxed max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-950 mb-1">Important Notice for Applicants</h4>
            <p className="text-amber-800">
              Please ensure all details entered in your request are complete and truthful. Once your request status advances to <strong>Approved</strong>, your document will be queued for printing and signature at the Barangay Hall. Make sure to present a valid ID upon claiming your document.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
