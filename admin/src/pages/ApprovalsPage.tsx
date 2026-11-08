import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  X,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getApprovals, updateApprovalStatus } from '../services/api';

export interface ApprovalData {
  id: string;
  userId: number;
  name: string;
  role: 'farmer' | 'seller' | 'transporter';
  email: string;
  phone: string;
  location: string;
  docType: string;
  idNumber: string;
  documentImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedFull: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<ApprovalData | null>(null);

  // 1. Fetch Real Approvals from Live Backend
  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getApprovals();

      if (response.data.success) {
        const mapped: ApprovalData[] = response.data.approvals.map((a: any) => ({
          id: String(a.id),
          userId: a.user_id,
          name: a.user_name,
          role: a.user_role,
          email: a.user_email,
          phone: a.user_phone,
          location: a.user_location,
          docType: a.doc_type,
          idNumber: a.id_number,
          documentImage:
            a.document_image_url ||
            'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&auto=format&fit=crop&q=80',
          status: a.status,
          submittedAt: a.submitted_at ? a.submitted_at.split('T')[0] : 'N/A',
          submittedFull: a.submitted_at ? new Date(a.submitted_at).toLocaleString() : 'N/A',
        }));
        setApprovals(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to load approvals from database'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Dynamic counts for each tab pill
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const currentList = approvals.filter((item) => item.status === activeTab);

  // 2. Real Backend Action: Approve Document & Verify User
  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await updateApprovalStatus(id, 'approved');
      if (res.data.success) {
        await fetchApprovals();
        if (selectedDoc?.id === id) setSelectedDoc(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve document');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Real Backend Action: Reject Document
  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await updateApprovalStatus(id, 'rejected');
      if (res.data.success) {
        await fetchApprovals();
        if (selectedDoc?.id === id) setSelectedDoc(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject document');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Warning Box */}
      <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          Review uploaded identity documents before approving new accounts. Farmers and retail sellers must upload their National ID. Transporters must upload their Driver's License. Approving an account sets their verified status to <strong className="text-emerald-700 dark:text-emerald-400">Verified</strong> in the live database.
        </p>
      </div>

      {/* Tabs Filter & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pending Tab */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'pending'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          {/* Approved Tab */}
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'approved'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {approvedCount}
            </span>
          </button>

          {/* Rejected Tab */}
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'rejected'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchApprovals}
          title="Refresh Approvals"
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Approvals Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading documents from Aiven MySQL...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <p className="text-slate-400 text-sm">No accounts found in {activeTab}.</p>
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-col justify-between gap-5 transition-all"
            >
              {/* Card Top: Details & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar Circle */}
                  <div className="w-11 h-11 rounded-full bg-emerald-900 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                    {item.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1.5">
                    {/* User Name & Details */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">
                        {item.name}
                      </h4>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                          item.role === 'farmer'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                            : item.role === 'seller'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50'
                        }`}
                      >
                        {item.role}
                      </span>
                      <span className="text-xs text-slate-400">{item.location}</span>
                    </div>

                    {/* Document Tag */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      item.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/60'
                        : item.status === 'approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                        : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 border-red-200/60'
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
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                {item.status === 'pending' ? (
                  <>
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={actionLoading === item.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading === item.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedDoc(item)}
                      className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Doc
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedDoc(item)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium py-1 transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Document Review</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {selectedDoc.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">{selectedDoc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {selectedDoc.role}
                  </span>
                  <span className="text-xs text-slate-400">{selectedDoc.email}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedDoc.phone || '-'}</p>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-400 mb-0.5">Location</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedDoc.location || '-'}</p>
              </div>
            </div>

            {/* Document Details Box */}
            <div className="bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 p-3.5 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm">
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
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video shadow-xs group">
                <img
                  src={selectedDoc.documentImage}
                  alt="Uploaded Document"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Submitted: {selectedDoc.submittedFull}
              </p>
            </div>

            {/* Bottom Actions inside Modal */}
            {selectedDoc.status === 'pending' && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleReject(selectedDoc.id)}
                  disabled={actionLoading === selectedDoc.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedDoc.id)}
                  disabled={actionLoading === selectedDoc.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}