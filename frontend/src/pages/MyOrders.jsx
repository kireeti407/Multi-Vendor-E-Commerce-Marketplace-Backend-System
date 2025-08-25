import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(null);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const res = await orderService.getOrders();
        setOrders(res.data.orders || []);
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    setCancelLoading(orderId);
    setCancelError("");
    try {
      await orderService.cancelOrder(orderId, "Cancelled by user");
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (err) {
      setCancelError("Failed to cancel order");
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 animate-pulse">
        <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }
  if (error) {
    return <div className="max-w-3xl mx-auto p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-gray-500">You have no orders yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Order #</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Total</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-2 px-4">
                    <Link to={`/orders/${order._id}`} className="text-blue-600 hover:underline">
                      {order._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
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
                  <td className="py-2 px-4 font-semibold">${order.total?.toFixed(2) || "-"}</td>
                  <td className="py-2 px-4">
                    {order.status === "pending" || order.status === "confirmed" ? (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelLoading === order._id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        {cancelLoading === order._id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cancelError && <div className="text-red-500 mt-2">{cancelError}</div>}
        </div>
      )}
    </div>
  );
}
