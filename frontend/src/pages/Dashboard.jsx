import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/orderService";
import reviewService from "../services/reviewService";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refetch orders when user logs in or after returning from checkout
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await orderService.getOrders();
        const ordersArr = res.data?.orders || res.data?.data?.orders || [];
        setOrders(ordersArr);
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
    // If coming from checkout, location.state?.orderPlaced will trigger refetch
  }, [user, location.state?.orderPlaced]);

  if (!user) return <div className="p-8 text-center">Loading...</div>;
  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name || user.email}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{orders.length}</div>
          <div className="text-gray-600">Orders</div>
        </div>
        {/* <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{reviews.length}</div>
          <div className="text-gray-600">Reviews</div>
        </div> */}
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{user?.role || "Customer"}</div>
          <div className="text-gray-600">Role</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Recent Orders</h3>
        {orders.length === 0 ? (
          <div className="text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Order ID</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{order._id.slice(-6)}</td>
                    <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{order.status}</td>
                    <td className="py-2 px-4 border-b">₹{order.total?.toFixed(2) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/*
      <div>
        <h3 className="text-xl font-semibold mb-2">Recent Reviews</h3>
        {reviews.length === 0 ? (
          <div className="text-gray-500">No reviews found.</div>
        ) : (
          <ul className="space-y-2">
            {reviews.slice(0, 5).map((review) => (
              <li key={review._id} className="bg-white rounded shadow p-3">
                <div className="font-semibold">{review.product?.name || "Product"}</div>
                <div className="text-sm text-gray-600 mb-1">{review.comment}</div>
                <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      */}
    </div>
  );
}
