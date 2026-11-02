import React from 'react';
import { CheckCircle2, Clock, XCircle, CheckCheck, FileText, User, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TrackingTimeline({ request }) {
  if (!request) return null;

  const currentStatus = request.status;
  const isRejected = currentStatus === 'Rejected';

  const steps = [
    { key: 'Pending', label: '1. Request Submitted', desc: 'Received & Queued' },
    { 
      key: isRejected ? 'Rejected' : 'Approved', 
      label: isRejected ? '2. Request Rejected' : '2. Verified & Approved', 
      desc: isRejected ? 'Verification Failed' : 'Ready for Printing' 
    },
    { key: 'Completed', label: '3. Released / Completed', desc: 'Claimed at Barangay Hall' },
  ];

  const getStepState = (stepKey) => {
    if (isRejected) {
      if (stepKey === 'Pending') return 'completed';
      if (stepKey === 'Rejected') return 'rejected';
      return 'upcoming';
    }

    if (currentStatus === 'Pending') {
      if (stepKey === 'Pending') return 'active';
      return 'upcoming';
    }

    if (currentStatus === 'Approved') {
      if (stepKey === 'Pending') return 'completed';
      if (stepKey === 'Approved') return 'active';
      return 'upcoming';
    }

    if (currentStatus === 'Completed') {
      return 'completed';
    }

    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Request Header Summary */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking Reference</span>
            <h4 className="text-xl font-bold text-slate-900">Request #{request.id}</h4>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500 text-xs block">Document Requested:</span>
            <span className="font-semibold text-slate-800">{request.document_name}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">Resident Name:</span>
            <span className="font-semibold text-slate-800">{request.full_name}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">Contact Number:</span>
            <span className="text-slate-700">{request.contact_number}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">Date Submitted:</span>
            <span className="text-slate-700">{new Date(request.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200">
          <span className="text-slate-500 text-xs block">Stated Purpose:</span>
          <p className="text-slate-800 text-sm mt-0.5 italic bg-white p-2.5 rounded-lg border border-slate-200">
            "{request.purpose}"
          </p>
        </div>

        {/* If Rejected, display prominent reason callout */}
        {isRejected && request.rejection_reason && (
          <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Rejection Reason from Barangay Admin:</span>
                <p className="text-sm mt-1 text-rose-700">{request.rejection_reason}</p>
                <p className="text-xs text-rose-600 mt-2">
                  Please review the reason above and submit a new request or visit the Barangay Hall for clarification.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Stepper */}
      <div>
        <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Workflow Progression</h5>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {steps.map((step, idx) => {
            const state = getStepState(step.key);

            let circleClass = 'bg-slate-100 text-slate-400 border-slate-300';
            let titleClass = 'text-slate-400';

            if (state === 'completed') {
              circleClass = 'bg-emerald-600 text-white border-emerald-600';
              titleClass = 'text-slate-900 font-bold';
            } else if (state === 'active') {
              circleClass = 'bg-blue-600 text-white border-blue-600 shadow-md ring-4 ring-blue-100';
              titleClass = 'text-blue-900 font-bold';
            } else if (state === 'rejected') {
              circleClass = 'bg-rose-600 text-white border-rose-600 shadow-md ring-4 ring-rose-100';
              titleClass = 'text-rose-900 font-bold';
            }

            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-2 transition-all ${circleClass}`}>
                  {state === 'completed' ? (
                    <CheckCheck className="w-5 h-5" />
                  ) : state === 'rejected' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className={`text-xs sm:text-sm ${titleClass}`}>{step.label}</div>
                <div className="text-[11px] text-slate-400 hidden sm:block mt-0.5">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Log */}
      <div>
        <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Audit Log & Status History</h5>
        {request.history && request.history.length > 0 ? (
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {request.history.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-3 pl-8">
                <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex-1 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800 text-sm">
                      {item.previous_status ? `${item.previous_status} → ${item.new_status}` : `Status: ${item.new_status}`}
                    </span>
                    <span className="text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{item.remarks}</p>
                  {item.updated_by_name && (
                    <span className="text-slate-400 block mt-1.5 text-[11px]">
                      Updated by: <strong className="text-slate-700">{item.updated_by_name}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No historical status records available.</p>
        )}
      </div>
    </div>
  );
}
