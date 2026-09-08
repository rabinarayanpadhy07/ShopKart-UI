import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { logout } from "@/api/auth";
import { getAdminOrders, getAdminUsers, getOverallAnalytics } from "@/api/admin";
import { getCategories, getProducts } from "@/api/products";

// Modularized Admin Tab Components
import { AdminOverview } from "./components/AdminOverview";
import { AdminOrders } from "./components/AdminOrders";
import { AdminProducts } from "./components/AdminProducts";
import { AdminCategories } from "./components/AdminCategories";
import { AdminUsers } from "./components/AdminUsers";
import { AdminFinance } from "./components/AdminFinance";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actions");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Shared Data States (Cached in memory across tabs)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [productsList, setProductsList] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [overallLoading, setOverallLoading] = useState(false);

  // Lazy tab loaders: only fetch what is needed when that tab is visited
  const fetchOrders = useCallback(async (force = false) => {
    if (orders.length > 0 && !force) return;
    setOrdersLoading(true);
    try {
      const data = await getAdminOrders({ skipCache: force });
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [orders.length]);

  const fetchUsers = useCallback(async (force = false) => {
    if (usersList.length > 0 && !force) return;
    setUsersLoading(true);
    try {
      const data = await getAdminUsers({ skipCache: force });
      setUsersList(data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [usersList.length]);

  const fetchCategories = useCallback(async (force = false) => {
    if (categoriesList.length > 0 && !force) return;
    setCategoriesLoading(true);
    try {
      const data = await getCategories({ skipCache: force });
      setCategoriesList(data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [categoriesList.length]);

  const fetchOverallStats = useCallback(async (force = false) => {
    if (overallStats && !force) return;
    setOverallLoading(true);
    try {
      const data = await getOverallAnalytics({ skipCache: force });
      setOverallStats(data);
    } catch (err) {
      console.error("Failed to load overall stats:", err);
    } finally {
      setOverallLoading(false);
    }
  }, [overallStats]);

  const fetchProductsSummary = useCallback(async () => {
    try {
      const data = await getProducts({ page: "0", size: "100" });
      setProductsList(data.products || []);
    } catch (err) {
      console.error("Failed to load products summary:", err);
    }
  }, []);

  // On mount: load overview requirements (single pass)
  useEffect(() => {
    fetchOverallStats();
    fetchCategories();
    fetchOrders();
    fetchUsers();
    fetchProductsSummary();
  }, [fetchOverallStats, fetchCategories, fetchOrders, fetchUsers, fetchProductsSummary]);

  // Tab activation: only fetch if not already populated
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "finance") {
      fetchOverallStats();
    }
  }, [activeTab, fetchOrders, fetchUsers, fetchCategories, fetchOverallStats]);

  useEffect(() => {
    const refreshOrders = () => fetchOrders(true);
    window.addEventListener("focus", refreshOrders);
    const refreshTimer = window.setInterval(refreshOrders, 30000);

    return () => {
      window.removeEventListener("focus", refreshOrders);
      window.clearInterval(refreshTimer);
    };
  }, [fetchOrders]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/admin");
    }
  };

  const navItems = [
    { id: "actions", label: "Overview", icon: LayoutDashboard },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      badge: orders.filter((o) =>
        ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)
      ).length,
    },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "users", label: "Users", icon: Users },
    { id: "finance", label: "Financials", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 w-full text-ink font-sans">
      {/* Mobile Top Navigation bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 w-full">
        <Logo size="default" variant="light" />
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-brand-muted">Admin Dashboard</span>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Sidebar */}
      <aside
        className={`bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-all duration-300 z-40 border-r border-slate-800
          ${isMobileSidebarOpen ? "fixed inset-y-0 left-0 w-64 md:relative" : "hidden md:flex"}
          ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div>
          {/* Logo Section */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            {!isSidebarCollapsed || isMobileSidebarOpen ? (
              <Logo size="default" variant="light" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white mx-auto">
                SK
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:block p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              aria-label="Toggle sidebar collapse"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer group
                    ${isActive ? "bg-slate-800 text-brand shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-850"}
                  `}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-brand" : "text-slate-400 group-hover:text-white"}`}
                  />
                  {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                    <span className="flex-grow text-left">{item.label}</span>
                  )}
                  {item.badge > 0 && (!isSidebarCollapsed || isMobileSidebarOpen) && (
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand font-black font-mono">
              AD
            </div>
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="flex-grow text-left">
                <p className="text-xs font-bold truncate">ShopKart Executive</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Administrator</p>
              </div>
            )}
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSidebarCollapsed && !isMobileSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex justify-center py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <header className="hidden md:flex justify-between items-center py-5 px-8 bg-white border-b border-slate-200 shadow-xs">
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-slate-800 capitalize">
              {activeTab === "actions" ? "Dashboard Overview" : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Control panel, metrics and actions for active site administration.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-brand-light text-brand flex items-center justify-center font-black text-[10px]">
                AD
              </span>
              Administrator
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow p-4 md:p-8 space-y-6">
          {activeTab === "actions" && (
            <AdminOverview
              overallStats={overallStats}
              overallLoading={overallLoading}
              orders={orders}
              productsList={productsList}
              usersList={usersList}
              onTabChange={setActiveTab}
              onOpenAddProduct={() => setActiveTab("products")}
              onInspectOrder={(order) => {
                setSelectedOrder(order);
                setActiveTab("orders");
              }}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrders
              orders={orders}
              ordersLoading={ordersLoading}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              onOrderUpdated={() => {
                fetchOrders(true);
                fetchOverallStats(true);
              }}
            />
          )}

          {activeTab === "products" && (
            <AdminProducts
              categoriesList={categoriesList}
              onProductMutated={() => {
                fetchProductsSummary();
                fetchCategories(true);
              }}
            />
          )}

          {activeTab === "categories" && (
            <AdminCategories
              categoriesList={categoriesList}
              categoriesLoading={categoriesLoading}
              productsList={productsList}
              onCategoryAdded={() => fetchCategories(true)}
            />
          )}

          {activeTab === "users" && (
            <AdminUsers
              usersList={usersList}
              usersLoading={usersLoading}
              onUserMutated={() => fetchUsers(true)}
            />
          )}

          {activeTab === "finance" && (
            <AdminFinance
              overallStats={overallStats}
              overallLoading={overallLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
