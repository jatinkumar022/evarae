# Caelvi Admin Panel

This is the admin panel for the Caelvi jewelry e-commerce website. It provides a complete management interface for store administrators.

## Features

### 🎯 Dashboard (`/admin`)

- Key metrics overview (revenue, orders, customers, products)
- Growth indicators with visual charts
- Recent orders and top products
- Quick access to important data

### 📦 Products Management (`/admin/products`)

- Complete CRUD operations for products
- Search and filter functionality
- Product grid with status badges
- Bulk actions and individual product management
- Product creation form with all necessary fields

### 🏷️ Categories Management (`/admin/categories`)

- Category listing with product counts
- Status management (active/inactive)
- Category creation and editing
- Visual category cards with actions

### 📋 Orders Management (`/admin/orders`)

- Order listing with detailed information
- Status tracking (pending, processing, shipped, delivered)
- Payment status management
- Customer and product details
- Export and print functionality

### 👥 Customers Management (`/admin/customers`)

- Customer database with contact information
- Order history and spending patterns
- Customer tier classification (Premium, Gold, Silver, Bronze)
- Customer activity tracking

### 📊 Inventory Management (`/admin/inventory`)

- Stock level tracking
- Low stock alerts
- Inventory value calculations
- Supplier and location management
- Stock level visualization

### 📈 Analytics (`/admin/analytics`)

- Revenue trends and charts
- Top performing products and categories
- Business insights and KPIs
- Recent activity feed
- Exportable reports

### ⚙️ Settings (`/admin/settings`)

- General store settings
- Notification preferences
- Security configurations
- Shipping and payment settings
- Multi-tab interface

## Layout Structure

The admin panel uses a completely separate layout from the main site:

- **No Main Site Components**: The admin panel does not inherit the main site's navbar, navigation menu, or footer
- **Standalone Design**: Complete admin-specific design with sidebar navigation
- **Responsive**: Works on both desktop and mobile devices
- **Modern UI**: Clean, professional interface with proper spacing and typography

## File Structure

```
src/app/admin/
├── layout.tsx              # Admin layout with sidebar (standalone)
├── page.tsx                # Dashboard
├── test/page.tsx           # Test page to verify layout
├── products/
│   ├── page.tsx           # Products listing
│   └── new/page.tsx       # Add new product
├── categories/
│   └── page.tsx           # Categories management
├── orders/
│   └── page.tsx           # Orders management
├── customers/
│   └── page.tsx           # Customers management
├── inventory/
│   └── page.tsx           # Inventory tracking
├── analytics/
│   └── page.tsx           # Analytics dashboard
├── settings/
│   └── page.tsx           # Settings configuration
└── README.md              # This documentation
```

## Key Features

✅ **Responsive Design** - Works on desktop and mobile  
✅ **Modern UI** - Clean, professional interface  
✅ **Real-time Data** - Live updates and status tracking  
✅ **Search & Filter** - Advanced filtering capabilities  
✅ **Export Functionality** - Data export options  
✅ **Status Management** - Visual status indicators  
✅ **Form Validation** - Input validation and error handling  
✅ **Modal Dialogs** - Confirmation dialogs for actions  
✅ **Navigation** - Easy navigation between sections  
✅ **Standalone Layout** - No interference from main site layout

## Testing

To verify the admin panel is working correctly:

1. Navigate to `/admin` - Should show the dashboard with sidebar
2. Navigate to `/admin/test` - Should show the test page
3. Check that the main site's navbar and footer are NOT visible
4. Test navigation between different admin pages
5. Verify all functionality works as expected

## Access

The admin panel is accessible at `/admin` and provides a complete management interface for the Caelvi jewelry store.
