import React, { useEffect, useState } from "react";
import orderService from "../../services/orderService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";

export default function ManageAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [status, search]);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await orderService.getAllOrders(params);
      setOrders(res.data?.orders || res.data?.data?.orders || []);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Manage All Orders</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="font-medium">Status:
          <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 border rounded p-1">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order number"
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
                <th className="py-2 px-4 text-left">Order #</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Customer</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Total</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-2 px-4">
                    <Link to={`/orders/${order._id}`} className="text-blue-600 hover:underline">
                      {order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    {order.customer?.name}<br />
                    <span className="text-xs text-gray-500">{order.customer?.email}</span>
                  </td>
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
                  <td className="py-2 px-4">
                    <Link to={`/orders/${order._id}`} className="text-blue-600 hover:underline text-sm">View</Link>
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
