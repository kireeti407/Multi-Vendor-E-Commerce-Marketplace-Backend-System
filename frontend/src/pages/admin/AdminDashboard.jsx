import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const res = await adminService.getDashboardStats();
  setStats(res.data || res.data?.data || res);
    } catch (err) {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats?.overview?.totalUsers ?? '-'}</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats?.overview?.totalVendors ?? '-'}</div>
              <div className="text-gray-600">Vendors</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats?.overview?.totalProducts ?? '-'}</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats?.overview?.totalOrders ?? '-'}</div>
              <div className="text-gray-600">Orders</div>
            </div>
            <div className="bg-pink-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">₹{stats?.overview?.totalRevenue?.toFixed(2) ?? '-'}</div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Recent Vendors</h3>
            {stats?.recentActivities?.recentVendors?.length === 0 ? (
              <div className="text-gray-500">No recent vendors.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Store Name</th>
                      <th className="py-2 px-4 text-left">Owner</th>
                      <th className="py-2 px-4 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivities?.recentVendors?.map((vendor) => (
                      <tr key={vendor._id} className="border-b">
                        <td className="py-2 px-4 font-semibold">{vendor.storeName}</td>
                        <td className="py-2 px-4">{vendor.user?.name || '-'}<br /><span className="text-xs text-gray-500">{vendor.user?.email}</span></td>
                        <td className="py-2 px-4">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Recent Orders</h3>
            {stats?.recentActivities?.recentOrders?.length === 0 ? (
              <div className="text-gray-500">No recent orders.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Order #</th>
                      <th className="py-2 px-4 text-left">Customer</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivities?.recentOrders?.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="py-2 px-4 font-semibold">{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                        <td className="py-2 px-4">{order.customer?.name || '-'}<br /><span className="text-xs text-gray-500">{order.customer?.email}</span></td>
                        <td className="py-2 px-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-2 px-4 capitalize">
                          <span className={
                            order.status === "cancelled"
                              ? "text-red-500"
                              : order.status === "delivered"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-semibold">₹{order.grandTotal?.toFixed(2) || order.total?.toFixed(2) || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Recent Reviews</h3>
            {stats?.recentActivities?.recentReviews?.length === 0 ? (
              <div className="text-gray-500">No recent reviews.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Product</th>
                      <th className="py-2 px-4 text-left">User</th>
                      <th className="py-2 px-4 text-left">Rating</th>
                      <th className="py-2 px-4 text-left">Comment</th>
                      <th className="py-2 px-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivities?.recentReviews?.map((review) => (
                      <tr key={review._id} className="border-b">
                        <td className="py-2 px-4">{review.product?.name || '-'}</td>
                        <td className="py-2 px-4">{review.customer?.name || '-'}<br /><span className="text-xs text-gray-500">{review.customer?.email}</span></td>
                        <td className="py-2 px-4">{review.rating}★</td>
                        <td className="py-2 px-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                        <td className="py-2 px-4">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
