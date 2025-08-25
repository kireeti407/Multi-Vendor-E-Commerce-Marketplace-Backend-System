import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    address: user?.address || {},
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const updated = await authService.updateProfile(formData);
      updateUser(updated.user || updated);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    try {
      await authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setPwSuccess("Password changed successfully!");
      setPasswords({ current: "", new: "" });
    } catch (err) {
      setPwError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      {success && <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{success}</p>}
      {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            type="text"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            name="address.street"
            placeholder="Street"
            value={formData.address?.street || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1 mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="address.city"
              placeholder="City"
              value={formData.address?.city || ""}
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              type="text"
              name="address.state"
              placeholder="State"
              value={formData.address?.state || ""}
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              type="text"
              name="address.zipCode"
              placeholder="Zip Code"
              value={formData.address?.zipCode || ""}
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              type="text"
              name="address.country"
              placeholder="Country"
              value={formData.address?.country || ""}
              onChange={handleChange}
              className="border rounded p-2"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <hr className="my-8" />
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>
      {pwSuccess && <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{pwSuccess}</p>}
      {pwError && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{pwError}</p>}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={e => setPasswords(pw => ({ ...pw, current: e.target.value }))}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={passwords.new}
            onChange={e => setPasswords(pw => ({ ...pw, new: e.target.value }))}
            className="w-full border rounded p-2 mt-1"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
