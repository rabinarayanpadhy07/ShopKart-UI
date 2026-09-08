import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  Package,
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus
} from "lucide-react";

export function AdminOverview({
  overallStats,
  overallLoading,
  orders = [],
  productsList = [],
  usersList = [],
  onTabChange,
  onOpenAddProduct,
  onInspectOrder,
}) {
  const lowStockProducts = productsList.filter((p) => p.stock <= 10);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const pendingOrdersCount = orders.filter((o) =>
    ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)
  ).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Dynamic Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:shadow-md transition-shadow border-slate-150 bg-white p-5 flex items-center justify-between text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Business Sales</p>
            {overallLoading ? (
              <p className="text-xl font-bold animate-pulse">...</p>
            ) : (
              <p className="text-2xl font-black text-slate-900">
                ₹{overallStats?.totalBusiness !== undefined ? parseFloat(overallStats.totalBusiness).toFixed(2) : "0.00"}
              </p>
            )}
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Sales analytics active
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="h-6 w-6" strokeWidth={2} />
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-155 bg-white p-5 flex items-center justify-between text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders Logged</p>
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
            <span className="text-[10px] text-blue-600 font-semibold">
              {pendingOrdersCount} pending fulfillment
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-155 bg-white p-5 flex items-center justify-between text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Catalog Size</p>
            <p className="text-2xl font-black text-slate-900">{productsList.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {lowStockProducts.length} low stock warnings
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Package className="h-6 w-6" strokeWidth={2} />
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-155 bg-white p-5 flex items-center justify-between text-left">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Accounts</p>
            <p className="text-2xl font-black text-slate-900">{usersList.length}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">
              {usersList.filter((u) => u.role === "ADMIN").length} Administrator roles
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users className="h-6 w-6" strokeWidth={2} />
          </div>
        </Card>
      </div>

      {/* Dynamic Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Warnings */}
        <Card className="lg:col-span-1 border-slate-205 bg-white flex flex-col justify-between text-left shadow-xs">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Inventory Stock Alerts
            </CardTitle>
            <CardDescription className="text-[11px]">List of items with low units.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-grow max-h-72 overflow-y-auto space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2 text-slate-400">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-600">Fully Stocked!</p>
                <p className="text-[10px]">No low stock products logged currently.</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.product_id} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-150 rounded-xl">
                  <div className="truncate max-w-[150px]">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">ID: {p.product_id}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.stock <= 0
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {p.stock <= 0 ? "Out of stock" : `${p.stock} units`}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders Feed */}
        <Card className="lg:col-span-2 border-slate-205 bg-white flex flex-col justify-between text-left shadow-xs">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#00ABE4]" /> Recent Incoming Orders
            </CardTitle>
            <CardDescription className="text-[11px]">Audit trail of the 5 most recent checkout orders.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-grow divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic">No order history recorded.</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-700">{order.orderId}</p>
                    <p className="text-[10px] text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-850 text-xs">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : order.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onInspectOrder(order)}
                      className="h-7 text-[10px] font-bold cursor-pointer"
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Administrative Control Grid */}
      <Card className="border-slate-205 bg-white text-left p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Administrative Actions</h3>
          <p className="text-xs text-slate-400">Quick shortcuts to execute administrative operations across the system.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onOpenAddProduct}
            className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">New Product</p>
            <p className="text-[10px] text-slate-400">Add an item to the catalog</p>
          </button>

          <button
            onClick={() => onTabChange("orders")}
            className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">Manage Orders</p>
            <p className="text-[10px] text-slate-400">View and update shipments</p>
          </button>

          <button
            onClick={() => onTabChange("categories")}
            className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">Categories</p>
            <p className="text-[10px] text-slate-400">Create product taxonomies</p>
          </button>

          <button
            onClick={() => onTabChange("finance")}
            className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">Sales Reports</p>
            <p className="text-[10px] text-slate-400">Daily, monthly & yearly audits</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
