import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import productService from "../services/productService";
import reviewService from "../services/reviewService";
import { useCart } from "../contexts/CartContext";

const fallbackImage = "https://via.placeholder.com/400";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const prodRes = await productService.getProduct(id);
        setProduct(prodRes.data.product);
        const revRes = await reviewService.getProductReviews(id);
        setReviews(revRes.data.reviews || []);
      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) addItem(product, 1);
  };

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      await reviewService.createReview({
        product: id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviewSuccess("Review submitted!");
      setReviewForm({ rating: 5, title: "", comment: "" });
      // Refresh reviews
      const revRes = await reviewService.getProductReviews(id);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      setReviewError("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 animate-pulse">
        <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-gray-200 h-64 w-full md:w-1/2 rounded"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="mt-8 h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }
  if (error) {
    return <div className="max-w-3xl mx-auto p-8 text-red-500">{error}</div>;
  }
  if (!product) return null;

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

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:underline">&larr; Back to Products</Link>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.images?.[0] || fallbackImage}
            alt={product.name}
            className="w-full h-72 object-cover rounded-2xl border"
          />
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-2">
              {product.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name + " " + (idx + 2)}
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">${discountedPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="line-through text-gray-400 text-lg">${product.price.toFixed(2)}</span>
            )}
            {hasDiscount && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {product.discount.type === "percentage"
                  ? `-${product.discount.value}%`
                  : `-${product.discount.value}$`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`w-5 h-5 inline-block ${i < Math.round(product.rating?.average || 0) ? "text-yellow-400" : "text-gray-300"}`}>
                ★
              </span>
            ))}
            <span className="text-sm text-gray-500 ml-2">
              ({product.rating?.count || 0} reviews)
            </span>
          </div>
          <p className="text-gray-700 mt-2">{product.description}</p>
          {product.specifications?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold mb-1">Specifications:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {product.specifications.map((spec, idx) => (
                  <li key={idx}><span className="font-medium">{spec.name}:</span> {spec.value}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-2">
            <span className={product.inventory?.quantity > 0 ? "text-green-600" : "text-red-500"}>
              {product.inventory?.quantity > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.inventory?.quantity === 0}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🛒 Add to Cart
          </button>
          {product.vendor?._id && (
            <div className="mt-4 text-sm">
              Sold by: <Link to={`/vendor/${product.vendor._id}`} className="text-blue-600 hover:underline font-semibold">{product.vendor.storeName}</Link>
              {product.vendor.rating && (
                <span className="ml-2 text-yellow-500">★ {product.vendor.rating.average?.toFixed(1) || 0}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        {reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review._id} className="bg-gray-50 rounded p-4 shadow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{review.customer?.name || "User"}</span>
                  <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                  <span className="text-gray-400 text-xs ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-medium">{review.title}</div>
                <div className="text-gray-700 text-sm">{review.comment}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Review */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
        {reviewError && <div className="text-red-500 mb-2">{reviewError}</div>}
        {reviewSuccess && <div className="text-green-600 mb-2">{reviewSuccess}</div>}
        <form onSubmit={handleReviewSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Rating</label>
            <select
              name="rating"
              value={reviewForm.rating}
              onChange={handleReviewChange}
              className="border rounded px-2 py-1"
              required
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={reviewForm.title}
              onChange={handleReviewChange}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Comment</label>
            <textarea
              name="comment"
              value={reviewForm.comment}
              onChange={handleReviewChange}
              className="border rounded px-2 py-1 w-full"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={reviewLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
