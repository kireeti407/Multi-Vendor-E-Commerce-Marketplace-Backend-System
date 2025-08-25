import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import vendorService from "../../services/vendorService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function VendorProfile() {
  const { user, updateUser } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ storeName: "", storeDescription: "", storeLogo: null, storeBanner: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");


  useEffect(() => {
    if (!user) return;
    // Only fetch if we have a valid vendorId or user._id and role is vendor
    let vendorId = user.vendorId;
    if (!vendorId && user.role === 'vendor' && user._id) {
      vendorId = user._id;
    }
    if (!vendorId) {
      setError('No vendor id found for this user.');
      setLoading(false);
      return;
    }
    fetchVendor(vendorId);
    // eslint-disable-next-line
  }, [user]);

  async function fetchVendor(vendorId) {
    setLoading(true);
    setError("");
    try {
      const res = await vendorService.getVendor(vendorId);
      setVendor(res.data?.vendor || res.vendor || res.data || res);
    } catch (err) {
      setError("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function startEdit() {
    setForm({
      storeName: vendor?.storeName || "",
      storeDescription: vendor?.storeDescription || "",
      storeLogo: null,
      storeBanner: null
    });
    setEditMode(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      await vendorService.updateVendorProfile(form);
      setEditMode(false);
      fetchVendor();
      if (form.storeName) updateUser({ storeName: form.storeName });
    } catch (err) {
      setActionError("Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-red-500 mb-4">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Vendor Profile</h2>
      {!editMode ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {vendor?.storeLogo && <img src={vendor.storeLogo} alt="logo" className="w-16 h-16 rounded-full object-cover" />}
            <div>
              <div className="text-xl font-semibold">{vendor?.storeName}</div>
              <div className="text-gray-500">{vendor?.storeDescription}</div>
            </div>
          </div>
          <div>
            <span className="font-medium">Owner:</span> {vendor?.user?.name} <span className="text-xs text-gray-500">({vendor?.user?.email})</span>
          </div>
          <div>
            <span className="font-medium">Joined:</span> {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "-"}
          </div>
          <div>
            <span className="font-medium">Status:</span> {vendor?.isApproved ? <span className="text-green-600 font-semibold">Approved</span> : <span className="text-yellow-600 font-semibold">Pending</span>}
          </div>
          <button onClick={startEdit} className="btn-primary mt-4">Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Store Name</label>
            <input type="text" name="storeName" value={form.storeName} onChange={handleFormChange} className="input-field" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Store Description</label>
            <textarea name="storeDescription" value={form.storeDescription} onChange={handleFormChange} className="input-field" rows={3} />
          </div>
          <div>
            <label className="block font-medium mb-1">Store Logo</label>
            <input type="file" name="storeLogo" accept="image/*" onChange={handleFormChange} className="input-field" />
          </div>
          <div>
            <label className="block font-medium mb-1">Store Banner</label>
            <input type="file" name="storeBanner" accept="image/*" onChange={handleFormChange} className="input-field" />
          </div>
          <div className="flex gap-4 mt-4">
            <button type="submit" disabled={actionLoading} className="btn-primary">{actionLoading ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
          </div>
          {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
        </form>
      )}
    </div>
  );
}
