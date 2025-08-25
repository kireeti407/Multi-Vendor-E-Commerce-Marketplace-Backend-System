import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User, Phone, Home, Image as ImageIcon, MapPin } from "lucide-react";


export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    avatar: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await axios.post("https://multi-vendor-e-commerce-marketplace.onrender.com/api/auth/register", formData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Your Account
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>
        )}
        {success && (
          <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{success}</p>
        )}

        {/* Name */}
        <div className="flex items-center border rounded-lg p-2">
          <User className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center border rounded-lg p-2">
          <Mail className="text-gray-400 mr-2" size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full outline-none"
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center border rounded-lg p-2">
          <Lock className="text-gray-400 mr-2" size={20} />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            className="w-full outline-none"
            required
            minLength={6}
          />
        </div>

        {/* Phone */}
        <div className="flex items-center border rounded-lg p-2">
          <Phone className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full outline-none"
          />
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center border rounded-lg p-2 col-span-2">
            <Home className="text-gray-400 mr-2" size={20} />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={formData.street}
              onChange={handleChange}
              className="w-full outline-none"
            />
          </div>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="border rounded-lg p-2 outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="border rounded-lg p-2 outline-none"
          />
          <input
            type="text"
            name="zipCode"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={handleChange}
            className="border rounded-lg p-2 outline-none"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="border rounded-lg p-2 outline-none"
          />
        </div>

        {/* Role Dropdown */}
        <div className="flex items-center border rounded-lg p-2">
          <MapPin className="text-gray-400 mr-2" size={20} />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full outline-none bg-transparent"
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center border rounded-lg p-2">
          <ImageIcon className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            name="avatar"
            placeholder="Avatar URL"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
