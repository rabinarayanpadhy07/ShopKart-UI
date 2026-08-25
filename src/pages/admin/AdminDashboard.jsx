import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import Logo from "@/components/layout/Logo";
import CustomModal from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actions"); // "actions" or "orders"
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);

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

  const cardData = [
    {
      title: "Add Product",
      description: "Create and manage new product listings with validation",
      team: "Product Management",
      modalType: "addProduct",
    },
    {
      title: "Delete Product",
      description: "Remove products from inventory system",
      team: "Product Management",
      modalType: "deleteProduct",
    },
  ];

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

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "finance") {
      fetchOverallStats();
    } else if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

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
      result = result.filter(o => o.status === statusFilter);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#032B2C] to-[#011414] text-white py-4 px-4 md:px-8 shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Logo />
            <nav className="flex space-x-4 text-sm font-semibold">
              <button
                onClick={() => setActiveTab("actions")}
                className={`transition-colors py-1.5 px-3 rounded-lg ${activeTab === "actions" ? "bg-teal-900/60 text-[#00ABE4]" : "text-gray-300 hover:text-white"}`}
              >
                Quick Actions
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`transition-colors py-1.5 px-3 rounded-lg ${activeTab === "orders" ? "bg-teal-900/60 text-[#00ABE4]" : "text-gray-300 hover:text-white"}`}
              >
                Order Management
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`transition-colors py-1.5 px-3 rounded-lg ${activeTab === "users" ? "bg-teal-900/60 text-[#00ABE4]" : "text-gray-300 hover:text-white"}`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("finance")}
                className={`transition-colors py-1.5 px-3 rounded-lg ${activeTab === "finance" ? "bg-teal-900/60 text-[#00ABE4]" : "text-gray-300 hover:text-white"}`}
              >
                Financial Management
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold border-r border-teal-900 pr-4">Admin Dashboard</span>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="font-bold text-xs">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-10 px-4 md:px-8">
        
        {/* Quick Actions Tab */}
        {activeTab === "actions" && (
          <>
            <div className="mb-6 text-left">
              <h1 className="text-3xl font-extrabold text-slate-800">Administrative Control Panel</h1>
              <p className="text-sm text-slate-500 mt-1">Select any operation below to manage inventory, users, and financials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cardData.map((card, index) => (
                <Card 
                  key={index} 
                  className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-gray-150/60 cursor-pointer bg-white group"
                  onClick={() => { setModalType(card.modalType); setResponse(null); }}
                >
                  <CardHeader className="p-5 pb-2 text-left">
                    <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-[#00ABE4] transition-colors">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 mt-1">
                      Team: <span className="font-medium text-slate-600">{card.team}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 text-left">
                    <p className="text-xs text-slate-500 line-clamp-3">{card.description}</p>
                    <div className="mt-4 text-xs font-bold text-[#00ABE4] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Manage Operations <span>→</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Order Management Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Orders Administration</h1>
              <p className="text-sm text-slate-500 mt-1">Review orders, update statuses, inspect delivery snapshots, and audit history logs.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{orders.length}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 shadow-xs">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-black text-amber-855 mt-1">{orders.filter(o => o.status === "PENDING").length}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-4 shadow-xs">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-black text-blue-855 mt-1">{orders.filter(o => ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length}</p>
              </div>
              <div className="bg-green-50 border border-green-200/50 rounded-xl p-4 shadow-xs">
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Delivered</p>
                <p className="text-2xl font-black text-green-855 mt-1">{orders.filter(o => o.status === "DELIVERED").length}</p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by Order ID or Customer ID..."
                  value={searchOrder}
                  onChange={e => setSearchOrder(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                  <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            {ordersLoading ? (
              <div className="text-center py-10 text-slate-500">Loading order records...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-slate-500">
                No orders match the criteria.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer ID</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {filteredOrders.map(order => (
                        <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs">{order.orderId}</td>
                          <td className="p-4">ID: {order.userId}</td>
                          <td className="p-4 font-semibold text-slate-900">₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                              order.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              order.status === 'RETURN_APPROVED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                              order.status === 'RETURNED' || order.status === 'REFUNDED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              onClick={() => { setSelectedOrder(order); fetchOrderHistory(order.orderId); setTransitionStatus(order.status); }}
                              size="sm"
                              className="text-xs font-bold"
                            >
                              Details
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

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Users Administration</h1>
              <p className="text-sm text-slate-500 mt-1">Review accounts, roles, registration dates, and launch profile adjustments.</p>
            </div>

            {/* Filter Toolbar */}
            <div className="flex bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by Username, Email or User ID..."
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Users Directory Table */}
            {usersLoading ? (
              <div className="text-center py-10 text-slate-500">Loading user accounts...</div>
            ) : filteredUsersList.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-slate-500">
                No users found.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="p-4">User ID</th>
                        <th className="p-4">Username</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {filteredUsersList.map(u => (
                        <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs">{u.userId}</td>
                          <td className="p-4 font-semibold text-slate-900">{u.username}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {new Date(u.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              onClick={() => handleViewUserSubmit({ userId: u.userId })}
                              size="sm"
                              className="text-xs font-bold mr-2"
                            >
                              Details
                            </Button>
                            <Button
                              onClick={() => {
                                setModalType("modifyUser");
                                setResponse(null);
                              }}
                              variant="secondary"
                              size="sm"
                              className="text-xs font-bold"
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

        {/* Financial Management Tab */}
        {activeTab === "finance" && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Financial Management</h1>
              <p className="text-sm text-slate-500 mt-1">Analyze revenue metrics, generate calendar-wise reports, and inspect category sales distributions.</p>
            </div>

            {/* Overall Revenue Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-[#032B2C] to-[#011414] text-white rounded-xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden border border-teal-955">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-teal-900/10 rounded-full blur-2xl"></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Cumulative Revenue</p>
                  <p className="text-[10px] text-gray-400 font-semibold">(Since inception)</p>
                </div>
                {overallLoading ? (
                  <p className="text-xl font-bold mt-4 animate-pulse">Loading revenue...</p>
                ) : (
                  <p className="text-3xl font-black text-[#00ABE4] mt-4">
                    ₹{overallStats?.totalBusiness !== undefined ? parseFloat(overallStats.totalBusiness).toFixed(2) : "0.00"}
                  </p>
                )}
              </div>

              {/* Quick Overall Category Sales Breakdown summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs md:col-span-2 text-left">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Overall Category Sales Distribution</h3>
                {overallLoading ? (
                  <p className="text-xs text-slate-400 italic">Loading sales categories...</p>
                ) : overallStats?.categorySales && Object.keys(overallStats.categorySales).length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(overallStats.categorySales).map(([cat, val]) => (
                      <div key={cat} className="bg-slate-50 border border-gray-150 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                        <span className="font-medium text-slate-600">{cat}:</span>
                        <span className="font-bold text-slate-800">{val} sales</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No category sales records recorded.</p>
                )}
              </div>
            </div>

            {/* Custom Business Report Generator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Controls Column */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs text-left space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Generate Report</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select a query level and date range parameter.</p>
                </div>

                <form onSubmit={fetchCustomFinancialReport} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Report Scope</label>
                    <div className="flex gap-2">
                      {["daily", "monthly", "yearly"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFinancialReportType(type);
                            setCustomReportData(null);
                          }}
                          className={`flex-grow h-8 text-xs font-bold rounded-lg border transition-all ${
                            financialReportType === type 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-gray-250 text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {financialReportType === "daily" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-750 uppercase">Select Date</label>
                      <Input type="date" id="date" name="date" required className="text-xs h-9.5" />
                    </div>
                  )}

                  {financialReportType === "monthly" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-750 uppercase">Select Month & Year</label>
                      <Input type="month" id="monthYear" name="monthYear" required className="text-xs h-9.5" />
                    </div>
                  )}

                  {financialReportType === "yearly" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-750 uppercase">Select Year</label>
                      <select id="year" name="year" required className="flex h-9.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00ABE4] focus:border-[#00ABE4]">
                        {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button type="submit" disabled={financialLoading} className="w-full text-xs font-bold h-9.5">
                    {financialLoading ? "Calculating..." : "Query Financial Report"}
                  </Button>
                </form>
              </div>

              {/* Report Output Column */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs text-left lg:col-span-2 flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Calculation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calculated aggregates for selected timeframe parameters.</p>
                </div>

                <div className="flex-grow flex flex-col justify-center py-4">
                  {financialLoading ? (
                    <div className="text-center text-slate-400 animate-pulse text-xs italic">Running database audits...</div>
                  ) : !customReportData ? (
                    <div className="text-center text-slate-400 text-xs italic">Select scope and dates to audit totals.</div>
                  ) : customReportData.error ? (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 text-center font-medium">
                      {customReportData.error}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-gray-150">
                        <span className="text-xs font-bold text-slate-700">Calculated Business Value</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{customReportData.totalBusiness !== undefined ? parseFloat(customReportData.totalBusiness).toFixed(2) : "0.00"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 border-b border-gray-150 pb-1.5">Category Breakdown:</h4>
                        {customReportData.categorySales && Object.keys(customReportData.categorySales).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                            {Object.entries(customReportData.categorySales).map(([cat, val]) => (
                              <div key={cat} className="flex justify-between items-center text-xs py-1.5 px-2 bg-slate-50 border border-gray-100 rounded-lg">
                                <span className="text-slate-650 font-medium">{cat}</span>
                                <span className="font-bold text-slate-800">{val} sales</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No sales recorded in any product categories.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Admin Order Details & Status Transition Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 p-6 space-y-6 text-left">
            <div className="border-b border-gray-150 pb-3 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Order details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Order Information</h4>
                  <p className="font-mono text-xs mt-1 text-slate-800">ID: {selectedOrder.orderId}</p>
                  <p className="text-xs mt-1 text-slate-600">Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Customer Information</h4>
                  <p className="mt-1 text-slate-800">User ID: {selectedOrder.userId}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Financial summary</h4>
                  <p className="text-lg font-bold text-slate-900 mt-1">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Delivery Address Snapshot</h4>
                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg text-xs mt-1 text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedOrder.formattedAddress || "No delivery address captured"}
                  </div>
                </div>

                {/* Items Ordered List */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Items Ordered</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-slate-50/50 p-2.5 rounded-lg border border-gray-150">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-100 last:border-0">
                          <div className="text-left">
                            <p className="font-bold text-slate-800">{item.productName}</p>
                            <p className="text-[10px] text-slate-500">Qty: {item.quantity} @ ₹{parseFloat(item.pricePerUnit).toFixed(2)}</p>
                          </div>
                          <span className="font-semibold text-slate-900">₹{parseFloat(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No products detail captured.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-4 border-l border-gray-150 pl-0 md:pl-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Update Workflow Status</h4>
                  <form onSubmit={handleStatusTransition} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">New Workflow Status</label>
                      <select
                        value={transitionStatus}
                        onChange={e => setTransitionStatus(e.target.value)}
                        className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAILED">FAILED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                        <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Audit Comments / Reason</label>
                      <Input
                        type="text"
                        placeholder="Transition comment..."
                        value={transitionComments}
                        onChange={e => setTransitionComments(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full text-xs font-bold h-9">
                      Apply Status Transition
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Audit Logs History */}
            <div className="border-t border-gray-150 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Workflow Audit trail</h4>
              {orderHistory.length === 0 ? (
                <p className="text-xs text-slate-500">No transition history logs recorded.</p>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {orderHistory.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-gray-150 rounded-lg text-xs leading-relaxed">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-1">
                        <span>Changed by: {log.changedBy}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700">
                        Transitioned from <span className="font-bold text-slate-900">{log.previousStatus}</span> to <span className="font-bold text-[#00ABE4]">{log.newStatus}</span>
                      </p>
                      {log.comments && (
                        <p className="text-slate-500 italic mt-0.5">Comment: &quot;{log.comments}&quot;</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-150 pt-4">
              <Button onClick={() => setSelectedOrder(null)} variant="outline">Close Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actions for General Quick Actions */}
      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => { setModalType(null); setResponse(null); }}
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
        />
      )}
    </div>
  );
};

export default AdminDashboard;
