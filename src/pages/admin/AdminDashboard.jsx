import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  IndianRupee,
  Store,
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
    { id: "actions", label: "Overview", icon: LayoutDashboard, description: "Store performance at a glance" },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      description: "Track, update and fulfil customer orders",
      badge: orders.filter((o) =>
        ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)
      ).length,
    },
    { id: "products", label: "Products", icon: Package, description: "Manage your catalog, pricing and stock" },
    { id: "categories", label: "Categories", icon: Layers, description: "Organise how products are grouped" },
    { id: "users", label: "Customers", icon: Users, description: "View and manage user accounts" },
    { id: "finance", label: "Financials", icon: IndianRupee, description: "Revenue and sales analytics" },
  ];

  const activeItem = navItems.find((i) => i.id === activeTab) || navItems[0];
  const showLabels = !isSidebarCollapsed || isMobileSidebarOpen;

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-ink">
      {/* Mobile drawer backdrop */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isMobileSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"}
          ${isSidebarCollapsed ? "md:w-[76px]" : "md:w-64"}
        `}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
          {showLabels ? (
            <Logo />
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-black text-white">SK</div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden rounded-lg p-1.5 text-ink-muted hover:bg-muted-bg hover:text-ink md:block cursor-pointer"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-muted-bg md:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin sections">
          {showLabels && <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Manage</p>}
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
                title={showLabels ? undefined : item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer
                  ${isActive ? "bg-ink text-white" : "text-ink-muted hover:bg-muted-bg hover:text-ink"}
                  ${showLabels ? "" : "justify-center"}
                `}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                {showLabels && <span className="flex-grow text-left">{item.label}</span>}
                {item.badge > 0 && showLabels && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-brand-light text-brand"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <a
            href="/"
            className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-muted-bg hover:text-ink ${showLabels ? "" : "justify-center"}`}
            title="View store"
          >
            <Store className="h-[18px] w-[18px] shrink-0" />
            {showLabels && "View store"}
          </a>
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-red-50 hover:text-danger cursor-pointer ${showLabels ? "" : "justify-center"}`}
            title="Log out"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {showLabels && "Log out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen min-w-0 flex-grow flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-ink-muted hover:bg-muted-bg md:hidden cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-ink">{activeItem.label}</h1>
              <p className="hidden truncate text-xs text-ink-muted sm:block">{activeItem.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-ink">Administrator</p>
              <p className="text-[11px] text-ink-muted">ShopKart</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">AD</div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-grow space-y-6 p-4 md:p-8">
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
