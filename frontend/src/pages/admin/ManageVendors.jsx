import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState("");

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line
  }, [status, search]);

  async function fetchVendors() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const res = await adminService.getAllVendors(params);
      setVendors(res.data?.vendors || res.data?.data?.vendors || []);
    } catch (err) {
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id + "approve");
    setActionError("");
    try {
      await adminService.approveVendor(id);
      setVendors((prev) => prev.map(v => v._id === id ? { ...v, isApproved: true, rejectionReason: "" } : v));
    } catch (err) {
      setActionError("Failed to approve vendor");
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      setActionError("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(id + "reject");
    setActionError("");
    try {
      await adminService.rejectVendor(id, rejectReason);
      setVendors((prev) => prev.map(v => v._id === id ? { ...v, isApproved: false, rejectionReason: rejectReason } : v));
      setShowRejectInput("");
      setRejectReason("");
    } catch (err) {
      setActionError("Failed to reject vendor");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Vendors</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="font-medium">Status:
          <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 border rounded p-1">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by store name or description"
          className="border rounded p-1 ml-2"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Store Name</th>
                <th className="py-2 px-4 text-left">Owner</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Joined</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No vendors found.</td></tr>
              ) : vendors.map((vendor) => (
                <tr key={vendor._id} className="border-b">
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      {vendor.storeLogo && <img src={vendor.storeLogo} alt="logo" className="w-8 h-8 rounded-full object-cover" />}
                      <span className="font-semibold">{vendor.storeName}</span>
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">{vendor.storeDescription}</div>
                  </td>
                  <td className="py-2 px-4">
                    {vendor.user?.name}<br />
                    <span className="text-xs text-gray-500">{vendor.user?.email}</span>
                  </td>
                  <td className="py-2 px-4">
                    {vendor.isApproved ? (
                      <span className="text-green-600 font-semibold">Approved</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">Pending</span>
                    )}
                    {vendor.rejectionReason && (
                      <div className="text-xs text-red-500">Rejected: {vendor.rejectionReason}</div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {vendor.user?.createdAt ? new Date(vendor.user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    {!vendor.isApproved ? (
                      <>
                        <button
                          onClick={() => handleApprove(vendor._id)}
                          disabled={actionLoading === vendor._id + "approve"}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60"
                        >
                          {actionLoading === vendor._id + "approve" ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => setShowRejectInput(vendor._id)}
                          disabled={actionLoading === vendor._id + "reject"}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        {showRejectInput === vendor._id && (
                          <div className="mt-2 flex flex-col gap-2">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection"
                              className="border rounded p-1 w-48"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(vendor._id)}
                                disabled={actionLoading === vendor._id + "reject"}
                                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-60"
                              >
                                {actionLoading === vendor._id + "reject" ? "Rejecting..." : "Confirm Reject"}
                              </button>
                              <button
                                onClick={() => { setShowRejectInput(""); setRejectReason(""); }}
                                className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
                              >Cancel</button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
        </div>
      )}
    </div>
  );
}
