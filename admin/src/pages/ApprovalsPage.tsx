import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  X,
  Check,
} from 'lucide-react';
import { mockApprovals, ApprovalItem } from '../data/mockData';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<ApprovalItem | null>(null);

  // Dynamic counts for each tab pill
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const currentList = approvals.filter((item) => item.status === activeTab);

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleReject = (id: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Alert Warning Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          Review uploaded identity documents before approving new accounts. Farmers and retail sellers must upload their National ID. Transporters must upload their Driver's License.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-3">
        {/* Pending Tab */}
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'pending'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Approved Tab */}
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'approved'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approved</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'approved'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {approvedCount}
          </span>
        </button>

        {/* Rejected Tab */}
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'rejected'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'rejected'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Approvals Cards List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <p className="text-slate-400 text-sm">No accounts found in {activeTab}.</p>
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between gap-5 transition-all hover:shadow-sm"
            >
              {/* Card Top: Details & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar Circle */}
                  <div className="w-11 h-11 rounded-full bg-emerald-900 text-white font-bold text-base flex items-center justify-center shrink-0">
                    {item.name.charAt(0)}
                  </div>

                  <div className="space-y-1.5">
                    {/* User Name & Details */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                          item.role === 'farmer'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.role === 'seller'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.role}
                      </span>
                      <span className="text-xs text-slate-400">{item.location}</span>
                    </div>

                    {/* Document Tag */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50/80 text-blue-600 border border-blue-100">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{item.docType}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {item.idNumber}
                      </span>
                    </div>

                    {/* Submission Metadata */}
                    <p className="text-xs text-slate-400 pt-1">
                      Submitted {item.submittedAt} · {item.email}
                    </p>
                  </div>
                </div>

                {/* Status Pill Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending'
                        ? 'bg-amber-50 text-amber-600'
                        : item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'pending'
                          ? 'bg-amber-500'
                          : item.status === 'approved'
                          ? 'bg-emerald-600'
                          : 'bg-red-500'
                      }`}
                    ></span>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                {item.status === 'pending' ? (
                  <>
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedDoc(item)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Doc
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedDoc(item)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium py-1 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Document Review</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {selectedDoc.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">{selectedDoc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                    {selectedDoc.role}
                  </span>
                  <span className="text-xs text-slate-400">{selectedDoc.email}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-slate-800">{selectedDoc.phone}</p>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 mb-0.5">Location</p>
                <p className="text-sm font-semibold text-slate-800">{selectedDoc.location}</p>
              </div>
            </div>

            {/* Document Details Box */}
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <FileText className="w-4 h-4" />
                <span>{selectedDoc.docType}</span>
              </div>
              <p className="text-xs font-mono text-blue-500 mt-1">{selectedDoc.idNumber}</p>
            </div>

            {/* Uploaded Document Image */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                UPLOADED DOCUMENT
              </p>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-xs group">
                <img
                  src={selectedDoc.documentImage}
                  alt="Uploaded Document"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl text-center shadow-md">
                    <p className="text-xs font-bold text-slate-800">{selectedDoc.docType}</p>
                    <p className="text-[11px] font-mono text-slate-500">{selectedDoc.idNumber}</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Submitted: {selectedDoc.submittedFull}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleReject(selectedDoc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedDoc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
