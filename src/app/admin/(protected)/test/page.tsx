'use client';

export default function AdminTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Test Page</h1>
        <p className="text-gray-600">
          This is a test page to verify the admin layout is working correctly.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Layout Test</h2>
        <p className="text-gray-600">
          If you can see this page with the admin sidebar and without the main
          site&apos;s navbar/footer, then the admin layout is working correctly.
        </p>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            ✅ Admin layout is working! The main site layout is not being
            applied to admin pages.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Navigation Test
        </h2>
        <p className="text-gray-600 mb-4">
          Test the navigation by clicking on different menu items in the
          sidebar:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Dashboard - Should show the main admin dashboard</li>
          <li>• Products - Should show the products management page</li>
          <li>• Categories - Should show the categories management page</li>
          <li>• Orders - Should show the orders management page</li>
          <li>• Customers - Should show the customers management page</li>
          <li>• Inventory - Should show the inventory management page</li>
          <li>• Analytics - Should show the analytics dashboard</li>
          <li>• Settings - Should show the settings configuration page</li>
        </ul>
      </div>
    </div>
  );
}
