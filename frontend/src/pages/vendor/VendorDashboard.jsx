import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import vendorService from "../../services/vendorService";
import orderService from "../../services/orderService";
import productService from "../../services/productService";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [statsData, ordersData, productsRes] = await Promise.all([
          vendorService.getDashboardStats(),
          orderService.getVendorOrders(),
          productService.getVendorProducts()
        ]);
        const statsObj = statsData?.data?.stats || statsData?.stats || statsData;
        setStats(statsObj);
        // Prefer recentOrders from stats if available
        if (statsObj?.recentOrders && Array.isArray(statsObj.recentOrders)) {
          setOrders(statsObj.recentOrders);
        } else if (statsData?.data?.recentOrders && Array.isArray(statsData.data.recentOrders)) {
          setOrders(statsData.data.recentOrders);
        } else {
          setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.orders || []));
        }
        // Accept both {products:[]} and []
        let products = [];
        if (Array.isArray(productsRes)) {
          products = productsRes;
        } else if (productsRes?.data?.products) {
          products = productsRes.data.products;
        } else if (productsRes?.products) {
          products = productsRes.products;
        }
        setProducts(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return <div className="p-8 text-center">Loading...</div>;
  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name || user.email} (Vendor)!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{stats?.totalOrders ?? orders.length}</div>
          <div className="text-gray-600">Orders</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{products.length}</div>
          <div className="text-gray-600">Products</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{stats?.totalRevenue ? `₹${stats.totalRevenue.toFixed(2)}` : "-"}</div>
          <div className="text-gray-600">Revenue</div>
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
                    <td className="py-2 px-4 border-b">${order.total?.toFixed(2) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Recent Products</h3>
        {products.length === 0 ? (
          <div className="text-gray-500">No products found.</div>
        ) : (
          <ul className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <li key={product._id} className="bg-white rounded shadow p-3 flex items-center gap-3">
                <img src={product.images?.[0] || "https://via.placeholder.com/60"} alt={product.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-xs text-gray-500">₹{product.price?.toFixed(2) || "-"}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
