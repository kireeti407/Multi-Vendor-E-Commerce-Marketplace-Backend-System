import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Page Not Found</p>
      <a href="/" className="text-blue-600 hover:underline">Go Home</a>
    </div>
  );
}
