import React, { useEffect, useState } from "react";
import vendorService from "../../services/vendorService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PERIODS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last year", value: "1y" },
];

export default function VendorAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    setError("");
    try {
      const res = await vendorService.getAnalytics(period);
      setAnalytics(res.data || res.data?.data || res);
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  // Prepare chart data
  const salesData = analytics?.salesData || analytics?.data?.salesData || [];
  const revenue = analytics?.revenueData?.totalRevenue ?? analytics?.data?.revenueData?.totalRevenue ?? analytics?.totalRevenue;
  const totalOrders = analytics?.revenueData?.totalOrders ?? analytics?.data?.revenueData?.totalOrders ?? analytics?.totalOrders;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Vendor Analytics</h2>
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Period:
          <select value={period} onChange={e => setPeriod(e.target.value)} className="ml-2 border rounded p-1">
            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">₹{revenue?.toFixed(2) ?? '-'}</div>
              <div className="text-gray-600">Revenue</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{totalOrders ?? '-'}</div>
              <div className="text-gray-600">Orders</div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Sales Over Time</h3>
            {salesData.length === 0 ? (
              <div className="text-gray-500">No sales data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Orders</th>
                      <th className="py-2 px-4 text-left">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((row) => (
                      <tr key={row._id?.date || row.date} className="border-b">
                        <td className="py-2 px-4">{row._id?.date || row.date}</td>
                        <td className="py-2 px-4">{row.orders}</td>
                        <td className="py-2 px-4">₹{row.sales?.toFixed(2) ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
