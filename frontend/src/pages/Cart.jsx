import React from "react";
import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // You can add auth check here if needed
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link to="/products" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      <ul className="divide-y divide-gray-200 mb-6">
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
            <li key={product._id} className="flex items-center gap-4 py-4">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/80"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="flex-1">
                <Link to={`/products/${product._id}`} className="font-semibold hover:underline">
                  {product.name}
                </Link>
                <div className="text-gray-500 text-sm">{product.description?.slice(0, 60)}...</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-green-600">₹{discountedPrice.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="line-through text-gray-400 text-sm">₹{product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(product._id, quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                    disabled={quantity <= 1}
                  >-</button>
                  <span className="px-2">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product._id, quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                    disabled={quantity >= (product.inventory?.quantity || 99)}
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(product._id)}
                  className="text-xs text-red-500 hover:underline"
                >Remove</button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between items-center mb-6">
        <span className="font-semibold">Total Items: {getTotalItems()}</span>
  <span className="font-bold text-xl">Total: ₹{getTotalPrice().toFixed(2)}</span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear Cart
        </button>
        <button
          onClick={handleCheckout}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
