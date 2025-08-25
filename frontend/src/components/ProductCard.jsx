import { useState } from "react";
import { Link } from "react-router-dom";

// Fallback image for products without images
const fallbackImage = "https://via.placeholder.com/300";

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const image = product.images?.[0] || fallbackImage;
  // Discount logic
  const hasDiscount =
    product.discount &&
    (!product.discount.startDate || new Date(product.discount.startDate) <= new Date()) &&
    (!product.discount.endDate || new Date(product.discount.endDate) >= new Date());
  const discountedPrice = hasDiscount
    ? product.discount.type === "percentage"
      ? product.price - product.price * (product.discount.value / 100)
      : Math.max(0, product.price - product.discount.value)
    : product.price;

  const cardContent = (
    <div className="shadow-md rounded-2xl hover:shadow-xl transition-all duration-300 bg-white group">
      <div className="relative">
        <img
          src={image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-2xl"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {product.discount.type === "percentage"
              ? `-${product.discount.value}%`
              : `-₹{product.discount.value}`}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-bold text-green-600">
            ₹{discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="line-through text-gray-400 text-sm">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`w-4 h-4 inline-block ${i < Math.round(product.rating?.average || 0) ? "text-yellow-400" : "text-gray-300"}`}>
              ★
            </span>
          ))}
          <span className="text-sm text-gray-500">
            ({product.rating?.count || 0})
          </span>
        </div>
        {product.inventory?.quantity > 0 ? (
          <p className="text-xs text-green-600 mt-1">In Stock</p>
        ) : (
          <p className="text-xs text-red-500 mt-1">Out of Stock</p>
        )}
        <button
          disabled={product.inventory?.quantity === 0}
          onClick={() => setAdded(true)}
          className="w-full mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          🛒 {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );

  // If vendor info exists, wrap the card in a Link to the vendor store
  if (product.vendor?._id) {
    return (
      <Link
        key={product.vendor._id}
        to={`/products/${product._id}`}
        className="card hover-scale bg-white group"
        style={{ textDecoration: 'none' }}
      >
        {cardContent}
      </Link>
    );
  }
  // Otherwise, just render the card
  return cardContent;
}
