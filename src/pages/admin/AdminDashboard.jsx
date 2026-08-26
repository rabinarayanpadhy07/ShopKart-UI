import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import CustomModal from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  DollarSign,
  LogOut,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  UserCheck,
  Calendar,
  Info
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actions"); // "actions" (Overview), "orders", "products", "categories", "users", "finance"
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [initialUserToModify, setInitialUserToModify] = useState(null);

  // Order Management States
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transitionStatus, setTransitionStatus] = useState("");
  const [transitionComments, setTransitionComments] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  // User Management States
  const [usersList, setUsersList] = useState([]);
  const [filteredUsersList, setFilteredUsersList] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Financial Management States
  const [financialReportType, setFinancialReportType] = useState("daily");
  const [overallStats, setOverallStats] = useState(null);
  const [customReportData, setCustomReportData] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [overallLoading, setOverallLoading] = useState(false);

  // Category Management States
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryFormName, setCategoryFormName] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Product Management States
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState("add");
  const [productForm, setProductForm] = useState({
    productId: null,
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: ""
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Order Management API Operations
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch("/admin/orders", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
        setFilteredOrders(data || []);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderHistory = async (orderId) => {
    try {
      const response = await fetch(`/admin/orders/${orderId}/history`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusTransition = async (e) => {
    e.preventDefault();
    if (!transitionStatus) return;

    try {
      const response = await fetch(`/admin/orders/${selectedOrder.orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: transitionStatus,
          comments: transitionComments
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedOrder(updated);
        setTransitionComments("");
        fetchOrders();
        fetchOrderHistory(updated.orderId);
        fetchOverallStats();
        alert("Order status updated successfully!");
      } else {
        const err = await response.json();
        alert(err.error || "Invalid status transition");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/admin/users", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data || []);
        setFilteredUsersList(data || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    setOverallLoading(true);
    try {
      const response = await fetch("/admin/analytics/overall", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setOverallStats(data);
      }
    } catch (err) {
      console.error("Failed to load overall business stats:", err);
    } finally {
      setOverallLoading(false);
    }
  };

  const fetchCustomFinancialReport = async (e) => {
    e.preventDefault();
    setFinancialLoading(true);
    setCustomReportData(null);
    const formData = new FormData(e.target);
    
    let url = "";
    if (financialReportType === "daily") {
      const dateVal = formData.get("date");
      url = `/admin/analytics/daily?date=${dateVal}`;
    } else if (financialReportType === "monthly") {
      const monthYear = formData.get("monthYear");
      if (monthYear) {
        const [year, month] = monthYear.split("-");
        url = `/admin/analytics/monthly?month=${parseInt(month, 10)}&year=${parseInt(year, 10)}`;
      }
    } else if (financialReportType === "yearly") {
      const year = formData.get("year");
      url = `/admin/analytics/yearly?year=${year}`;
    }
    
    if (!url) {
      setFinancialLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        setCustomReportData(data);
      } else {
        setCustomReportData({ error: data.error || "Failed to load report" });
      }
    } catch (err) {
      setCustomReportData({ error: "Failed to query server" });
    } finally {
      setFinancialLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/products/categories", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setCategoriesList(data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormName.trim()) return;

    try {
      const response = await fetch("/admin/products/categories/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ categoryName: categoryFormName.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        setCategoryFormName("");
        fetchCategories();
        alert("Category created successfully!");
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch (err) {
      console.error("Error creating category:", err);
      alert("Error contacting the server");
    }
  };

  const fetchAdminProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products?page=0&size=100", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products || []);
        setFilteredProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/admin/products/delete/${productId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        alert("Product deleted successfully!");
        fetchAdminProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock, 10),
      categoryId: parseInt(productForm.categoryId, 10),
      imageUrl: productForm.imageUrl
    };

    try {
      let response;
      if (productModalMode === "add") {
        response = await fetch("/admin/products/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`/admin/products/modify/${productForm.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (response.ok) {
        alert(`Product ${productModalMode === "add" ? "added" : "modified"} successfully!`);
        setIsProductModalOpen(false);
        fetchAdminProducts();
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Initial dashboard load
  const loadDashboardData = async () => {
    fetchOrders();
    fetchUsers();
    fetchAdminProducts();
    fetchCategories();
    fetchOverallStats();
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refetch data when switching tabs
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "finance") {
      fetchOverallStats();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "products") {
      fetchAdminProducts();
      fetchCategories();
    } else if (activeTab === "actions") {
      loadDashboardData();
    }
  }, [activeTab]);

  // Sync state filter updates
  useEffect(() => {
    let result = productsList;
    if (searchProductQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchProductQuery.toLowerCase())) ||
        (p.product_id && p.product_id.toString().includes(searchProductQuery))
      );
    }
    setFilteredProducts(result);
  }, [searchProductQuery, productsList]);

  useEffect(() => {
    let result = usersList;
    if (searchUserQuery) {
      result = result.filter(u => 
        u.username.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        u.userId.toString().includes(searchUserQuery)
      );
    }
    setFilteredUsersList(result);
  }, [searchUserQuery, usersList]);

  useEffect(() => {
    let result = orders;
    if (searchOrder) {
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(searchOrder.toLowerCase()) || 
        o.userId.toString().includes(searchOrder)
      );
    }
    if (statusFilter) {
      if (statusFilter === "PENDING") {
        result = result.filter(o => ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status));
      } else if (statusFilter === "RETURN_APPROVED") {
        result = result.filter(o => ["RETURN_APPROVED", "ITEM_PICKED_UP", "RETURNED", "REFUNDED"].includes(o.status));
      } else {
        result = result.filter(o => o.status === statusFilter);
      }
    }
    setFilteredOrders(result);
  }, [searchOrder, statusFilter, orders]);

  const handleAddProductSubmit = async (productData) => {
    try {
      const response = await fetch("/admin/products/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      setResponse({ product: data, imageUrl: productData.imageUrl });
      setModalType("addProduct");
      fetchAdminProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProductSubmit = async ({ productId }) => {
    try {
      const response = await fetch(`/admin/products/delete/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      setResponse(data);
      setModalType("deleteProduct");
      fetchAdminProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleViewUserSubmit = async ({ userId }) => {
    try {
      const response = await fetch(`/admin/users/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setResponse({ user: data });
      } else {
        setResponse({ message: data.error || "User not found" });
      }
      setModalType("response");
    } catch (error) {
      console.error("Error viewing user:", error);
      setResponse({ message: "Error loading user details" });
      setModalType("response");
    }
  };

  const handleModifyUserSubmit = async ({ userId, username, email, role }) => {
    try {
      const response = await fetch(`/admin/users/modify/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, role }),
      });
      const data = await response.json();
      setResponse(data);
      setModalType("modifyUser");
      fetchUsers();
    } catch (error) {
      console.error("Error modifying user:", error);
    }
  };

  const handleMonthlyBusinessSubmit = async ({ month, year }) => {
    try {
      const response = await fetch(`/admin/analytics/monthly?month=${month}&year=${year}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setResponse(data);
      setModalType("monthlyBusiness");
    } catch (error) {
      console.error("Error fetching monthly business:", error);
    }
  };

  const handleDailyBusinessSubmit = async ({ date }) => {
    try {
      const response = await fetch(`/admin/analytics/daily?date=${date}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setResponse(data);
      setModalType("dailyBusiness");
    } catch (error) {
      console.error("Error fetching daily business:", error);
    }
  };

  const handleYearlyBusinessSubmit = async ({ year }) => {
    try {
      const response = await fetch(`/admin/analytics/yearly?year=${year}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setResponse(data);
      setModalType("yearlyBusiness");
    } catch (error) {
      console.error("Error fetching yearly business:", error);
    }
  };

  const handleOverallBusinessSubmit = async () => {
    try {
      const response = await fetch("/admin/analytics/overall", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setResponse(data);
      setModalType("overallBusiness");
    } catch (error) {
      console.error("Error fetching overall business:", error);
    }
  };

  // Helper count variables
  const lowStockProducts = productsList.filter(p => p.stock <= 10);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getProductCountForCategory = (catName) => {
    return productsList.filter(p => p.category === catName).length;
  };

  // Navigation Items
  const navItems = [
    { id: "actions", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, badge: orders.filter(o => ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "users", label: "Users", icon: Users },
    { id: "finance", label: "Financials", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 w-full text-ink font-sans">
      
      {/* Mobile Top Nav bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 w-full">
        <Logo size="default" variant="light" />
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-[#00ABE4]">Admin Dashboard</span>
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
            className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
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
            {(!isSidebarCollapsed || isMobileSidebarOpen) ? (
              <Logo size="default" variant="light" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white mx-auto">SK</div>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="hidden md:block p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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
                    ${isActive 
                      ? "bg-slate-800 text-[#00ABE4] shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#00ABE4]" : "text-slate-400 group-hover:text-white"}`} />
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
          <div className="flex items-center gap-3 p-2 bg-slate-955/40 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#00ABE4] font-black font-mono">
              AD
            </div>
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="flex-grow text-left">
                <p className="text-xs font-bold truncate">ShopKart Executive</p>
                <p className="text-[10px] text-slate-550 font-semibold uppercase">Administrator</p>
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
        {/* Top bar on Desktop */}
        <header className="hidden md:flex justify-between items-center py-5 px-8 bg-white border-b border-slate-200 shadow-xs">
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-slate-850 capitalize">
              {activeTab === "actions" ? "Dashboard Overview" : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Control panel, metrics and actions for active site administration.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Server Online
            </span>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-grow p-4 md:p-8 space-y-6">
          
          {/* 1. OVERVIEW / QUICK ACTIONS TAB */}
          {activeTab === "actions" && (
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
                      {orders.filter(o => ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length} pending fulfillment
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
                      {usersList.filter(u => u.role === "ADMIN").length} Administrator roles
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
                    <CardDescription className="text-[11px]">List of items with extremely low units.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow max-h-72 overflow-y-auto space-y-3">
                    {lowStockProducts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2 text-slate-400">
                        <CheckCircle className="h-10 w-10 text-emerald-500" />
                        <p className="text-xs font-semibold text-slate-600">Fully Stocked!</p>
                        <p className="text-[10px]">No low stock products logged currently.</p>
                      </div>
                    ) : (
                      lowStockProducts.map(p => (
                        <div key={p.product_id} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-150 rounded-xl">
                          <div className="truncate max-w-[150px]">
                            <p className="font-bold text-slate-800 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {p.product_id}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.stock <= 0 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
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
                      recentOrders.map(order => (
                        <div key={order.orderId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-700">{order.orderId}</p>
                            <p className="text-[10px] text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-850 text-xs">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {order.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => { setSelectedOrder(order); fetchOrderHistory(order.orderId); setTransitionStatus(order.status); }}
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
                    onClick={() => {
                      setProductModalMode("add");
                      setProductForm({ productId: null, name: "", description: "", price: "", stock: "", categoryId: categoriesList[0]?.categoryId || "", imageUrl: "" });
                      setIsProductModalOpen(true);
                    }}
                    className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand transition-colors">Add Product</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Create and write new catalog listing details</p>
                  </button>

                  <button 
                    onClick={() => { setModalType("deleteProduct"); setResponse(null); }}
                    className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors">Delete Product</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Purge listings from index database</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab("categories")}
                    className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-9 h-9 bg-[#00ABE4]/10 text-[#00ABE4] rounded-xl flex items-center justify-center">
                      <Layers className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#00ABE4] transition-colors">Create Category</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Setup custom inventory categories</p>
                  </button>

                  <button 
                    onClick={() => { setModalType("modifyUser"); setResponse(null); }}
                    className="p-4 bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:border-slate-200 rounded-xl transition-all text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Adjust Roles</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Grant administrative access attributes</p>
                  </button>
                </div>
              </Card>

            </div>
          )}

          {/* 2. ORDER MANAGEMENT TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6 text-left animate-fade-up">
              
              {/* Order summary stats bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending Fulfillment</p>
                  <p className="text-2xl font-black text-amber-800 mt-0.5">
                    {orders.filter(o => ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length}
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Delivered Orders</p>
                  <p className="text-2xl font-black text-emerald-800 mt-0.5">{orders.filter(o => o.status === "DELIVERED").length}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Cancelled / Returned</p>
                  <p className="text-2xl font-black text-rose-800 mt-0.5">
                    {orders.filter(o => ["CANCELLED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED", "ITEM_PICKED_UP", "RETURNED", "REFUNDED"].includes(o.status)).length}
                  </p>
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <div className="flex-grow relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search order list by ID or User ID..."
                    value={searchOrder}
                    onChange={e => setSearchOrder(e.target.value)}
                    className="text-xs h-10 pl-10"
                  />
                </div>
                <div className="sm:w-56">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-350 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                    <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                    <option value="RETURN_REJECTED">RETURN_REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {ordersLoading ? (
                <div className="text-center py-12 text-slate-500 italic">Audit trail loading...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 italic">
                  No orders match current query parameters.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Order Reference</th>
                          <th className="p-4">Customer Account</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Workflow Status</th>
                          <th className="p-4">Transaction Date</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map(order => (
                          <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono text-xs font-bold text-slate-800">{order.orderId}</td>
                            <td className="p-4 text-xs font-medium">Account ID: {order.userId}</td>
                            <td className="p-4 font-bold text-slate-900">₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                order.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                order.status === 'RETURN_APPROVED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                order.status === 'RETURN_REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                order.status === 'ITEM_PICKED_UP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                order.status === 'RETURNED' || order.status === 'REFUNDED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-semibold">
                              {new Date(order.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                onClick={() => { setSelectedOrder(order); fetchOrderHistory(order.orderId); setTransitionStatus(order.status); }}
                                size="sm"
                                variant="outline"
                                className="text-[10px] font-bold h-8 cursor-pointer"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PRODUCT MANAGEMENT TAB */}
          {activeTab === "products" && (
            <div className="space-y-6 text-left animate-fade-up">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Catalog Inventory</h2>
                  <p className="text-xs text-slate-400">Edit, add or remove catalog product items.</p>
                </div>
                <Button
                  onClick={() => {
                    setProductModalMode("add");
                    setProductForm({ productId: null, name: "", description: "", price: "", stock: "", categoryId: categoriesList[0]?.categoryId || "", imageUrl: "" });
                    setIsProductModalOpen(true);
                  }}
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add Product
                </Button>
              </div>

              {/* Filtering Toolbar */}
              <div className="flex bg-white border border-slate-205 p-4 rounded-2xl shadow-xs">
                <div className="flex-grow relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search product indices by Name, description or ID..."
                    value={searchProductQuery}
                    onChange={e => setSearchProductQuery(e.target.value)}
                    className="text-xs h-10 pl-10"
                  />
                </div>
              </div>

              {/* Table */}
              {productsLoading ? (
                <div className="text-center py-12 text-slate-500 italic">Inventory compiling...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-slate-205 rounded-2xl p-10 text-center text-slate-400 italic">
                  No inventory products found matching the criteria.
                </div>
              ) : (
                <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Visual</th>
                          <th className="p-4">Product ID</th>
                          <th className="p-4">Listing Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Base Price</th>
                          <th className="p-4">Stock Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map(p => {
                          const firstImage = p.images && p.images[0] ? p.images[0] : "";
                          const catObj = categoriesList.find(c => c.categoryName === p.category);
                          const catId = catObj ? catObj.categoryId : "";

                          return (
                            <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <img
                                  src={firstImage || "https://via.placeholder.com/48?text=No+Image"}
                                  alt={p.name}
                                  className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-150"
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/48?text=No+Image"; }}
                                />
                              </td>
                              <td className="p-4 font-mono text-xs text-slate-500 font-semibold">#{p.product_id}</td>
                              <td className="p-4 font-bold text-slate-800 max-w-xs truncate">{p.name}</td>
                              <td className="p-4 text-xs font-semibold text-slate-500">{p.category || "Uncategorized"}</td>
                              <td className="p-4 font-extrabold text-slate-900">₹{parseFloat(p.price).toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  p.stock <= 0 ? "bg-red-50 text-red-700 border-red-200" :
                                  p.stock <= 10 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="p-4 text-center space-x-2">
                                <Button
                                  onClick={() => {
                                    setProductModalMode("edit");
                                    setProductForm({
                                      productId: p.product_id,
                                      name: p.name,
                                      description: p.description || "",
                                      price: p.price ? p.price.toString() : "",
                                      stock: p.stock ? p.stock.toString() : "",
                                      categoryId: catId,
                                      imageUrl: firstImage
                                    });
                                    setIsProductModalOpen(true);
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="text-[10px] font-bold h-8 cursor-pointer"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleProductDelete(p.product_id)}
                                  variant="destructive"
                                  size="sm"
                                  className="text-[10px] font-bold h-8 cursor-pointer"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. CATEGORY MANAGEMENT TAB */}
          {activeTab === "categories" && (
            <div className="space-y-6 text-left animate-fade-up">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Category Directory</h2>
                <p className="text-xs text-slate-400">Classify product inventories and view metrics.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add Category Form */}
                <Card className="border-slate-205 bg-white p-5 shadow-xs h-fit">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Add Product Category</h3>
                  <p className="text-xs text-slate-400 mb-4">Input values to register a new directory type.</p>
                  
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Category Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Smart Electronics"
                        value={categoryFormName}
                        onChange={e => setCategoryFormName(e.target.value)}
                        required
                        className="text-xs h-10"
                      />
                    </div>
                    <Button type="submit" className="w-full text-xs font-bold h-10 cursor-pointer">
                      Register Category
                    </Button>
                  </form>
                </Card>

                {/* Categories List */}
                <Card className="lg:col-span-2 border-slate-205 bg-white p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Configured Categories</h3>
                  <p className="text-xs text-slate-400 mb-4">Active product directory mappings.</p>
                  
                  {categoriesLoading ? (
                    <div className="text-center py-10 text-slate-500 italic">Accessing database categories...</div>
                  ) : categoriesList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 italic">No categories found in the database.</div>
                  ) : (
                    <div className="overflow-hidden border border-slate-150 rounded-xl">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Category ID</th>
                            <th className="p-3">Category Name</th>
                            <th className="p-3 text-center">Associated Products</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {categoriesList.map(c => (
                            <tr key={c.categoryId} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono text-xs text-slate-500">#{c.categoryId}</td>
                              <td className="p-3 font-bold text-slate-800">{c.categoryName}</td>
                              <td className="p-3 text-center">
                                <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-bold">
                                  {getProductCountForCategory(c.categoryName)} items
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* 5. USER MANAGEMENT TAB */}
          {activeTab === "users" && (
            <div className="space-y-6 text-left animate-fade-up">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Accounts Directory</h2>
                <p className="text-xs text-slate-400">View user directories and manage staff roles.</p>
              </div>

              {/* Filtering Toolbar */}
              <div className="flex bg-white border border-slate-205 p-4 rounded-2xl shadow-xs">
                <div className="flex-grow relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search accounts directory by Username, Email or ID..."
                    value={searchUserQuery}
                    onChange={e => setSearchUserQuery(e.target.value)}
                    className="text-xs h-10 pl-10"
                  />
                </div>
              </div>

              {/* Table */}
              {usersLoading ? (
                <div className="text-center py-12 text-slate-500 italic">User index compiling...</div>
              ) : filteredUsersList.length === 0 ? (
                <div className="bg-white border border-slate-205 rounded-2xl p-10 text-center text-slate-400 italic">
                  No accounts found matching search string.
                </div>
              ) : (
                <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-4">User ID</th>
                          <th className="p-4">Username</th>
                          <th className="p-4">Email Address</th>
                          <th className="p-4">Security Role</th>
                          <th className="p-4">Creation Date</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsersList.map(u => (
                          <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono text-xs text-slate-500">#{u.userId}</td>
                            <td className="p-4 font-bold text-slate-800">{u.username}</td>
                            <td className="p-4 text-xs font-semibold text-slate-600">{u.email}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-semibold">
                              {new Date(u.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 text-center space-x-2">
                              <Button
                                onClick={() => handleViewUserSubmit({ userId: u.userId })}
                                size="sm"
                                variant="outline"
                                className="text-[10px] font-bold h-8 cursor-pointer"
                              >
                                Details
                              </Button>
                              <Button
                                onClick={() => {
                                  setInitialUserToModify(u);
                                  setModalType("modifyUser");
                                  setResponse(null);
                                }}
                                variant="secondary"
                                size="sm"
                                className="text-[10px] font-bold h-8 cursor-pointer bg-slate-850 text-white hover:bg-slate-700"
                              >
                                Edit Role
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. FINANCIAL AUDITS TAB */}
          {activeTab === "finance" && (
            <div className="space-y-6 text-left animate-fade-up">
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden border border-slate-800">
                  <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#00ABE4]/10 rounded-full blur-2xl"></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cumulative Value</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">(Since database initiation)</p>
                  </div>
                  {overallLoading ? (
                    <p className="text-xl font-bold mt-4 animate-pulse">Running metrics...</p>
                  ) : (
                    <p className="text-3xl font-black text-[#00ABE4] mt-4">
                      ₹{overallStats?.totalBusiness !== undefined ? parseFloat(overallStats.totalBusiness).toFixed(2) : "0.00"}
                    </p>
                  )}
                </Card>

                {/* Category Sales Breakdown */}
                <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs md:col-span-2 text-left">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Category Sales Distribution</h3>
                  {overallLoading ? (
                    <p className="text-xs text-slate-400 italic">Calculating categories...</p>
                  ) : overallStats?.categorySales && Object.keys(overallStats.categorySales).length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(overallStats.categorySales).map(([cat, val]) => (
                        <div key={cat} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                          <span className="font-semibold text-slate-500">{cat}:</span>
                          <span className="font-black text-slate-800">{val} checkouts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No checkout categories indexed.</p>
                  )}
                </Card>
              </div>

              {/* Custom Financial Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Report Form */}
                <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Generate Audit Report</h3>
                    <p className="text-xs text-slate-400">Select parameters to query billing database.</p>
                  </div>

                  <form onSubmit={fetchCustomFinancialReport} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Audit Interval</label>
                      <div className="flex gap-2">
                        {["daily", "monthly", "yearly"].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setFinancialReportType(type);
                              setCustomReportData(null);
                            }}
                            className={`flex-grow h-9 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              financialReportType === type 
                                ? "bg-slate-900 border-slate-900 text-white" 
                                : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {financialReportType === "daily" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Select Target Date</label>
                        <Input type="date" id="date" name="date" required className="text-xs h-10" />
                      </div>
                    )}

                    {financialReportType === "monthly" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Select Month & Year</label>
                        <Input type="month" id="monthYear" name="monthYear" required className="text-xs h-10" />
                      </div>
                    )}

                    {financialReportType === "yearly" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Select Target Year</label>
                        <select id="year" name="year" required className="flex h-10 w-full rounded-xl border border-slate-350 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00ABE4]">
                          {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <Button type="submit" disabled={financialLoading} className="w-full text-xs font-bold h-10 cursor-pointer">
                      {financialLoading ? "Running query..." : "Query Database"}
                    </Button>
                  </form>
                </Card>

                {/* Audit calculation results */}
                <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs text-left lg:col-span-2 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Audit Calculation Results</h3>
                    <p className="text-xs text-slate-400">Values generated from specific query parameters.</p>
                  </div>

                  <div className="flex-grow flex flex-col justify-center py-4">
                    {financialLoading ? (
                      <div className="text-center text-slate-400 animate-pulse text-xs italic">Auditing database records...</div>
                    ) : !customReportData ? (
                      <div className="text-center text-slate-400 text-xs italic">Select scope parameters and run query.</div>
                    ) : customReportData.error ? (
                      <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-150 text-center font-medium">
                        {customReportData.error}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-150">
                          <span className="text-xs font-bold text-slate-655">Sum Business Value</span>
                          <span className="text-2xl font-black text-slate-900">
                            ₹{customReportData.totalBusiness !== undefined ? parseFloat(customReportData.totalBusiness).toFixed(2) : "0.00"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-150 pb-2">Category Sales breakdown:</h4>
                          {customReportData.categorySales && Object.keys(customReportData.categorySales).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
                              {Object.entries(customReportData.categorySales).map(([cat, val]) => (
                                <div key={cat} className="flex justify-between items-center text-xs py-2 px-3 bg-slate-50 border border-slate-150 rounded-xl">
                                  <span className="text-slate-500 font-semibold">{cat}</span>
                                  <span className="font-extrabold text-slate-855">{val} units</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No sales recorded for this period.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* order detailed description modal overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-left">
            <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Order Invoice Summary</h2>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {selectedOrder.orderId}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-slate-400 hover:text-slate-655 text-2xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Details</h4>
                  <p className="text-xs mt-1 text-slate-600 font-semibold">Date Logged: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="text-xs mt-1 text-slate-600 font-semibold">Customer Account: #{selectedOrder.userId}</p>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Destination</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedOrder.formattedAddress || "No delivery address captured"}
                  </div>
                </div>

                {/* Items Ordered */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Itemized List</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 last:border-0">
                          <div className="text-left">
                            <p className="font-bold text-slate-800">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Qty: {item.quantity} × ₹{parseFloat(item.pricePerUnit).toFixed(2)}</p>
                          </div>
                          <span className="font-bold text-slate-900">₹{parseFloat(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No products description captured.</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Total Invoice Sum</span>
                    <span className="text-base font-black text-slate-900">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-6">
                {selectedOrder.status === "RETURN_REQUESTED" && (
                  <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-left">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Pending Return Request
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Reason: <strong className="text-slate-800">&quot;{selectedOrder.returnReason}&quot;</strong>
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to ACCEPT this return request?")) {
                            try {
                              const response = await fetch(`/admin/orders/${selectedOrder.orderId}/status`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                  status: "RETURN_APPROVED",
                                  comments: "Return request accepted by administrator."
                                })
                              });
                              if (response.ok) {
                                const updated = await response.json();
                                setSelectedOrder(updated);
                                fetchOrders();
                                fetchOrderHistory(updated.orderId);
                                fetchOverallStats();
                                alert("Return request accepted!");
                              } else {
                                const err = await response.json();
                                alert(err.error || "Failed to accept return");
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }}
                        className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                      >
                        Accept Return
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to REJECT this return request?")) {
                            try {
                              const response = await fetch(`/admin/orders/${selectedOrder.orderId}/status`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                  status: "RETURN_REJECTED",
                                  comments: "Return request rejected by administrator."
                                })
                              });
                              if (response.ok) {
                                const updated = await response.json();
                                setSelectedOrder(updated);
                                fetchOrders();
                                fetchOrderHistory(updated.orderId);
                                fetchOverallStats();
                                alert("Return request rejected!");
                              } else {
                                const err = await response.json();
                                alert(err.error || "Failed to reject return");
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }}
                        className="bg-red-650 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                      >
                        Reject Return
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Update Workflow Status</h4>
                  <form onSubmit={handleStatusTransition} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">New Status</label>
                      <select
                        value={transitionStatus}
                        onChange={e => setTransitionStatus(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                        <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                        <option value="RETURN_REJECTED">RETURN_REJECTED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Transition Comment</label>
                      <Input
                        type="text"
                        placeholder="Reason for change..."
                        value={transitionComments}
                        onChange={e => setTransitionComments(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <Button type="submit" className="w-full text-xs font-bold h-9 cursor-pointer">
                      Commit Status Transition
                    </Button>
                  </form>
                </div>

                {/* Audit Logs */}
                <div className="border-t border-slate-150 pt-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Audit trail</h4>
                  {orderHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No transition comments recorded.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {orderHistory.map(log => (
                        <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs leading-relaxed">
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-1">
                            <span>Admin: {log.changedBy}</span>
                            <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700">
                            Status <span className="font-bold text-slate-800">{log.previousStatus}</span> → <span className="font-extrabold text-[#00ABE4]">{log.newStatus}</span>
                          </p>
                          {log.comments && (
                            <p className="text-[10px] text-slate-400 italic mt-1 bg-white p-1 px-1.5 border border-slate-100 rounded">
                              &quot;{log.comments}&quot;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-150 pt-4">
              <Button onClick={() => setSelectedOrder(null)} variant="outline" className="cursor-pointer">Close Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actions for General Quick Actions */}
      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => { setModalType(null); setResponse(null); setInitialUserToModify(null); }}
          onSubmit={(data) => {
            switch (modalType) {
              case "addProduct":
                handleAddProductSubmit(data);
                break;
              case "deleteProduct":
                handleDeleteProductSubmit(data);
                break;
              case "viewUser":
                handleViewUserSubmit(data);
                break;
              case "modifyUser":
                handleModifyUserSubmit(data);
                break;
              case "monthlyBusiness":
                handleMonthlyBusinessSubmit(data);
                break;
              case "dailyBusiness":
                handleDailyBusinessSubmit(data);
                break;
              case "yearlyBusiness":
                handleYearlyBusinessSubmit(data);
                break;
              case "overallBusiness":
                handleOverallBusinessSubmit();
                break;
              default:
                break;
            }
          }}
          response={response}
          initialUser={initialUserToModify}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}

      {/* Local Product Add/Edit Dialog with live image preview */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-left">
            <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{productModalMode === "add" ? "Register Product" : "Edit Catalog Item"}</h2>
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="text-slate-400 hover:text-slate-655 text-2xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleProductFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="p-name">Product Name:</label>
                <Input
                  type="text"
                  id="p-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="text-xs h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700" htmlFor="p-price">Base Price (₹):</label>
                  <Input
                    type="number"
                    step="0.01"
                    id="p-price"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    className="text-xs h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700" htmlFor="p-stock">Stock Units:</label>
                  <Input
                    type="number"
                    id="p-stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                    className="text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="p-category">Category Directory Mapping:</label>
                <select
                  id="p-category"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-350 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="p-imageUrl">Image Source Link:</label>
                <Input
                  type="text"
                  id="p-imageUrl"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  required
                  className="text-xs h-10"
                />
                
                {/* Live Image Preview */}
                {productForm.imageUrl && (productForm.imageUrl.startsWith("http") || productForm.imageUrl.startsWith("/")) && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img 
                      src={productForm.imageUrl} 
                      alt="Form Preview" 
                      className="h-14 w-14 rounded-lg object-cover bg-slate-200 border" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-[10px] text-slate-500">
                      <p className="font-bold text-slate-655">Image Live Preview</p>
                      <p className="truncate max-w-[300px]">{productForm.imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="p-description">Listing Description:</label>
                <textarea
                  id="p-description"
                  rows="3"
                  className="flex w-full rounded-xl border border-slate-350 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00ABE4] transition-colors"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)} className="cursor-pointer">Cancel</Button>
                <Button type="submit" className="cursor-pointer">Save Catalog Details</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
