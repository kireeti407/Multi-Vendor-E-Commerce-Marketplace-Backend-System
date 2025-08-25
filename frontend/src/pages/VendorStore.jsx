import React from "react";

export default function VendorStore() {
  // Placeholder for vendor store page
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="h-12 w-1/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="mt-8 h-24 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}
