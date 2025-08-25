import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/orderService";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: user?.address?.country || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return <div className="p-8 text-center">Please login to checkout.</div>;
  }
  if (items.length === 0) {
    return <div className="p-8 text-center">Your cart is empty.</div>;
  }

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const orderData = {
        items: items.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        total: getTotalPrice(),
      };
      await orderService.createOrder(orderData);
      setSuccess("Order placed successfully!");
      clearCart();
      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{success}</div>}
      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={address.name}
            onChange={handleAddressChange}
            className="w-full border rounded p-2 mb-2"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={address.phone}
            onChange={handleAddressChange}
            className="w-full border rounded p-2 mb-2"
            required
          />
          <input
            type="text"
            name="street"
            placeholder="Street"
            value={address.street}
            onChange={handleAddressChange}
            className="w-full border rounded p-2 mb-2"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              value={address.zipCode}
              onChange={handleAddressChange}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={address.country}
              onChange={handleAddressChange}
              className="border rounded p-2"
              required
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="card">Credit/Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <ul className="divide-y divide-gray-200 mb-2">
            {items.map(({ product, quantity }) => {
              const hasDiscount =
                product.discount &&
                (!product.discount.startDate || new Date(product.discount.startDate) <= new Date()) &&
                (!product.discount.endDate || new Date(product.discount.endDate) >= new Date());
              const discountedPrice = hasDiscount
                ? product.discount.type === "percentage"
                  ? product.price - product.price * (product.discount.value / 100)
                  : Math.max(0, product.price - product.discount.value)
                : product.price;
              return (
                <li key={product._id} className="flex justify-between py-2">
                  <span>{product.name} x {quantity}</span>
                  <span>₹{(discountedPrice * quantity).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
