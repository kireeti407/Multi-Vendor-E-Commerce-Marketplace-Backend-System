
import React, { useEffect, useState } from "react";
import productService from "../../services/productService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CATEGORY_OPTIONS = [
  "Electronics", "Clothing", "Home & Garden", "Sports & Outdoors", "Books",
  "Beauty & Health", "Toys & Games", "Automotive", "Jewelry", "Art & Crafts", "Other"
];

const initialForm = {
  name: "",
  price: "",
  comparePrice: "",
  cost: "",
  sku: "",
  description: "",
  category: "",
  images: [],
  specifications: [],
  weight: "",
  dimensions: { length: "", width: "", height: "" },
  inventory: { quantity: 0, trackQuantity: true, lowStockThreshold: 1 },
  isActive: true,
  isFeatured: false,
  tags: "",
  seoTitle: "",
  seoDescription: "",
  discount: { type: "", value: "", startDate: "", endDate: "" }
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await productService.getVendorProducts();
      let prods = [];
      if (Array.isArray(res)) prods = res;
      else if (res?.data?.products) prods = res.data.products;
      else if (res?.products) prods = res.products;
      setProducts(prods);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (name.startsWith("inventory.")) {
      setForm(f => ({ ...f, inventory: { ...f.inventory, [name.split(".")[1]]: type === "checkbox" ? checked : value } }));
    } else if (name.startsWith("dimensions.")) {
      setForm(f => ({ ...f, dimensions: { ...f.dimensions, [name.split(".")[1]]: value } }));
    } else if (name.startsWith("discount.")) {
      setForm(f => ({ ...f, discount: { ...f.discount, [name.split(".")[1]]: value } }));
    } else if (name === "images") {
      setForm(f => ({ ...f, images: files ? Array.from(files) : [] }));
    } else if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  // Specifications handlers
  function handleSpecChange(idx, key, val) {
    setForm(f => {
      const specs = [...(f.specifications || [])];
      specs[idx][key] = val;
      return { ...f, specifications: specs };
    });
  }
  function addSpec() {
    setForm(f => ({ ...f, specifications: [...(f.specifications || []), { name: "", value: "" }] }));
  }
  function removeSpec(idx) {
    setForm(f => {
      const specs = [...(f.specifications || [])];
      specs.splice(idx, 1);
      return { ...f, specifications: specs };
    });
  }

  function openCreateForm() {
    setEditProduct(null);
    setForm(initialForm);
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditProduct(product);
    setForm({
      name: product.name || "",
      price: product.price || "",
      comparePrice: product.comparePrice || "",
      cost: product.cost || "",
      sku: product.sku || "",
      description: product.description || "",
      category: product.category || "",
      images: [],
      specifications: product.specifications || [],
      weight: product.weight || "",
      dimensions: {
        length: product.dimensions?.length || "",
        width: product.dimensions?.width || "",
        height: product.dimensions?.height || ""
      },
      inventory: {
        quantity: product.inventory?.quantity || 0,
        trackQuantity: product.inventory?.trackQuantity ?? true,
        lowStockThreshold: product.inventory?.lowStockThreshold || 1
      },
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      tags: (product.tags || []).join(", "),
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      discount: {
        type: product.discount?.type || "",
        value: product.discount?.value || "",
        startDate: product.discount?.startDate ? product.discount.startDate.slice(0, 10) : "",
        endDate: product.discount?.endDate ? product.discount.endDate.slice(0, 10) : ""
      }
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setActionLoading("submit");
    setActionError("");
    try {
      // Prepare tags and images for backend
      const submitForm = {
        ...form,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        images: form.images,
        specifications: form.specifications
      };
      if (editProduct) {
        await productService.updateProduct(editProduct._id, submitForm);
      } else {
        await productService.createProduct(submitForm);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setActionError("Failed to save product");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setActionLoading(id + "delete");
    setActionError("");
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setActionError("Failed to delete product");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Products</h2>
      <button onClick={openCreateForm} className="mb-4 btn-primary">Add New Product</button>
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Stock</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found.</td></tr>
              ) : products.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="py-2 px-4 font-semibold">{product.name}</td>
                  <td className="py-2 px-4">₹{product.price?.toFixed(2) || "-"}</td>
                  <td className="py-2 px-4">{product.inventory?.quantity ?? "-"}</td>
                  <td className="py-2 px-4">
                    {product.isActive ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-red-500 font-semibold">Inactive</span>}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button onClick={() => openEditForm(product)} className="btn-secondary text-sm">Edit</button>
                    <button onClick={() => handleDelete(product._id)} disabled={actionLoading === product._id + "delete"} className="btn-outline text-sm">{actionLoading === product._id + "delete" ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowForm(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
            <h3 className="text-xl font-semibold mb-4">{editProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Basic Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label>
                    <input autoFocus type="text" name="name" value={form.name} onChange={handleFormChange} className="input-field" required placeholder="Product name" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category <span className="text-red-500">*</span></label>
                    <select name="category" value={form.category} onChange={handleFormChange} className="input-field" required>
                      <option value="">Select Category</option>
                      {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">SKU <span className="text-red-500">*</span></label>
                    <input type="text" name="sku" value={form.sku} onChange={handleFormChange} className="input-field" required placeholder="Unique SKU" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} className="input-field" rows={2} required placeholder="Product description" />
                  </div>
                </div>
              </div>
              {/* Pricing */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Price (₹) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={form.price} onChange={handleFormChange} className="input-field" min="0" step="0.01" required placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Compare Price</label>
                    <input type="number" name="comparePrice" value={form.comparePrice} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Cost</label>
                    <input type="number" name="cost" value={form.cost} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                </div>
              </div>
              {/* Images */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Images</h4>
                <input type="file" name="images" multiple accept="image/*" onChange={handleFormChange} className="input-field" />
                {form.images && form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(form.images).map((img, idx) => (
                      <img
                        key={idx}
                        src={typeof img === "string" ? img : URL.createObjectURL(img)}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">You can upload multiple images. Only image files are allowed.</p>
              </div>
              {/* Specifications */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Specifications</h4>
                {(form.specifications || []).map((spec, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input type="text" placeholder="Name" value={spec.name} onChange={e => handleSpecChange(idx, "name", e.target.value)} className="input-field" />
                    <input type="text" placeholder="Value" value={spec.value} onChange={e => handleSpecChange(idx, "value", e.target.value)} className="input-field" />
                    <button type="button" onClick={() => removeSpec(idx)} className="btn-outline">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="btn-secondary mt-1">Add Specification</button>
                <p className="text-xs text-gray-500 mt-1">Add key-value pairs for product specifications.</p>
              </div>
              {/* Physical Details */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Physical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={form.weight} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Length (cm)</label>
                    <input type="number" name="dimensions.length" value={form.dimensions.length} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Width (cm)</label>
                    <input type="number" name="dimensions.width" value={form.dimensions.width} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Height (cm)</label>
                    <input type="number" name="dimensions.height" value={form.dimensions.height} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                </div>
              </div>
              {/* Inventory */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Inventory</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Stock</label>
                    <input type="number" name="inventory.quantity" value={form.inventory.quantity} onChange={handleFormChange} className="input-field" min="0" />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" name="inventory.trackQuantity" checked={form.inventory.trackQuantity} onChange={handleFormChange} />
                    <label>Track Quantity</label>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Low Stock Threshold</label>
                    <input type="number" name="inventory.lowStockThreshold" value={form.inventory.lowStockThreshold} onChange={handleFormChange} className="input-field" min="1" />
                  </div>
                </div>
              </div>
              {/* Status & Tags */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Status & Tags</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} />
                    <label>Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleFormChange} />
                    <label>Featured</label>
                  </div>
                  <div className="col-span-2">
                    <label className="block font-medium mb-1">Tags (comma separated)</label>
                    <input type="text" name="tags" value={form.tags} onChange={handleFormChange} className="input-field" placeholder="e.g. summer, sale, trending" />
                  </div>
                </div>
              </div>
              {/* SEO */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">SEO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">SEO Title</label>
                    <input type="text" name="seoTitle" value={form.seoTitle} onChange={handleFormChange} className="input-field" placeholder="SEO title for search engines" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">SEO Description</label>
                    <textarea name="seoDescription" value={form.seoDescription} onChange={handleFormChange} className="input-field" rows={2} placeholder="SEO description for search engines" />
                  </div>
                </div>
              </div>
              {/* Discount */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Discount</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Type</label>
                    <select name="discount.type" value={form.discount.type} onChange={handleFormChange} className="input-field">
                      <option value="">None</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Value</label>
                    <input type="number" name="discount.value" value={form.discount.value} onChange={handleFormChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Start Date</label>
                    <input type="date" name="discount.startDate" value={form.discount.startDate} onChange={handleFormChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">End Date</label>
                    <input type="date" name="discount.endDate" value={form.discount.endDate} onChange={handleFormChange} className="input-field" />
                  </div>
                </div>
              </div>
              {/* Submit/Cancel */}
              <div className="flex gap-4 mt-4 justify-end">
                <button type="submit" disabled={actionLoading === "submit"} className="btn-primary min-w-[100px] flex items-center justify-center">
                  {actionLoading === "submit" ? <span className="loader mr-2"></span> : null}
                  {actionLoading === "submit" ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary min-w-[100px]">Cancel</button>
              </div>
              {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
