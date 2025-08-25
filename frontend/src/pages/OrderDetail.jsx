import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const res = await orderService.getOrder(id);
        setOrder(res.data.order || res.data.data?.order || null);
      } catch (err) {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError("");
    try {
      await orderService.cancelOrder(order._id, "Cancelled by user");
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      setCancelError("Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error) {
    return <div className="max-w-2xl mx-auto p-8 text-red-500">{error}</div>;
  }
  if (!order) {
    return <div className="max-w-2xl mx-auto p-8 text-gray-500">Order not found.</div>;
  }

  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-gray-600 text-sm">Order # <span className="font-mono">{order.orderNumber || order._id?.slice(-6).toUpperCase()}</span></div>
          <div className="text-gray-600 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className={
            order.status === "cancelled"
              ? "text-red-500 font-semibold"
              : order.status === "delivered"
              ? "text-green-600 font-semibold"
              : "text-yellow-600 font-semibold"
          }>
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Items</h3>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item._id} className="py-3 flex items-center gap-4">
              {item.product?.images?.[0] && (
                <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <div className="font-medium">{item.product?.name || "Product"}</div>
                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                <div className="text-sm text-gray-500">Price: ₹{item.price?.toFixed(2)}</div>
              </div>
              <div className="font-semibold">₹{item.total?.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping & Payment */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-1">Shipping Address</h4>
          <div className="text-sm text-gray-700">
            {order.shippingAddress?.name}<br />
            {order.shippingAddress?.phone}<br />
            {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
            {order.shippingAddress?.state}, {order.shippingAddress?.zipCode}<br />
            {order.shippingAddress?.country}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Payment</h4>
          <div className="text-sm text-gray-700">
            Method: {order.paymentMethod?.replace(/_/g, " ") || "-"}<br />
            Status: <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>{order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-6">
        <h4 className="font-semibold mb-1">Order Summary</h4>
        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal:</span>
          <span>₹{order.totalAmount?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Shipping:</span>
          <span>₹{order.shippingCost?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Tax:</span>
          <span>₹{order.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
          <span>Total:</span>
          <span>₹{order.grandTotal?.toFixed(2)}</span>
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && (
        <div className="mb-4">
          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            className="btn-primary px-6 py-2 disabled:opacity-60"
          >
            {cancelLoading ? "Cancelling..." : "Cancel Order"}
          </button>
          {cancelError && <div className="text-red-500 mt-2 text-sm">{cancelError}</div>}
        </div>
      )}

      {/* Back to orders */}
      <button
        onClick={() => navigate("/orders")}
        className="btn-secondary px-6 py-2 mt-2"
      >
        Back to My Orders
      </button>
    </div>
  );
}
