import React, { useEffect, useState } from "react";
import reviewService from "../../services/reviewService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [status, rating]);

  async function fetchReviews() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (rating) params.rating = rating;
      const res = await reviewService.getAllReviews(params);
      setReviews(res.data?.reviews || res.data?.data?.reviews || []);
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  const handleModerate = async (id, action) => {
    setActionLoading(id + action);
    setActionError("");
    try {
      await reviewService.moderateReview(id, action);
      setReviews((prev) => prev.map(r => r._id === id ? { ...r, isApproved: action === "approve" } : r));
    } catch (err) {
      setActionError("Failed to update review status");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(id + "delete");
    setActionError("");
    try {
      await reviewService.deleteReview(id);
      setReviews((prev) => prev.filter(r => r._id !== id));
    } catch (err) {
      setActionError("Failed to delete review");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Reviews</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="font-medium">Status:
          <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 border rounded p-1">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className="font-medium">Rating:
          <select value={rating} onChange={e => setRating(e.target.value)} className="ml-2 border rounded p-1">
            <option value="">All</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </label>
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
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-left">User</th>
                <th className="py-2 px-4 text-left">Rating</th>
                <th className="py-2 px-4 text-left">Comment</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No reviews found.</td></tr>
              ) : reviews.map((review) => (
                <tr key={review._id} className="border-b">
                  <td className="py-2 px-4">
                    {review.product?.name}
                  </td>
                  <td className="py-2 px-4">
                    {review.customer?.name}
                  </td>
                  <td className="py-2 px-4">
                    <span className="font-semibold">{review.rating}★</span>
                  </td>
                  <td className="py-2 px-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                  <td className="py-2 px-4">
                    {review.isApproved ? (
                      <span className="text-green-600 font-semibold">Approved</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    {!review.isApproved ? (
                      <button
                        onClick={() => handleModerate(review._id, "approve")}
                        disabled={actionLoading === review._id + "approve"}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        {actionLoading === review._id + "approve" ? "Approving..." : "Approve"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(review._id, "reject")}
                        disabled={actionLoading === review._id + "reject"}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-60"
                      >
                        {actionLoading === review._id + "reject" ? "Rejecting..." : "Reject"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={actionLoading === review._id + "delete"}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-60"
                    >
                      {actionLoading === review._id + "delete" ? "Deleting..." : "Delete"}
                    </button>
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
