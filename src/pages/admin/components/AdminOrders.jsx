import React, { useState, useMemo } from "react";
import { Search, AlertTriangle, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { updateOrderStatus, getOrderHistory } from "@/api/admin";

export function AdminOrders({
  orders = [],
  ordersLoading = false,
  onOrderUpdated,
  selectedOrder,
  setSelectedOrder,
}) {
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transitionStatus, setTransitionStatus] = useState("");
  const [transitionComments, setTransitionComments] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { status, comments, label } | null
  const [applyingAction, setApplyingAction] = useState(false);
  const toast = useToast();

  // Filter orders client-side by ID or User ID or Status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchOrder ||
        (order.orderId && order.orderId.toLowerCase().includes(searchOrder.toLowerCase())) ||
        (order.userId && order.userId.toString().includes(searchOrder));
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchOrder, statusFilter]);

  const handleInspect = async (order) => {
    setSelectedOrder(order);
    setTransitionStatus(order.status);
    setTransitionComments("");
    setHistoryLoading(true);
    try {
      const data = await getOrderHistory(order.orderId);
      setOrderHistory(data || []);
    } catch (err) {
      console.error("Failed to load order history:", err);
      setOrderHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusTransitionSubmit = (e) => {
    e.preventDefault();
    if (!transitionStatus || !selectedOrder) return;
    if (transitionStatus === selectedOrder.status) {
      toast.info("Order is already in that status.");
      return;
    }
    setPendingAction({
      status: transitionStatus,
      comments: transitionComments,
      label: `Move this order to ${transitionStatus}?`,
      successMessage: "Order status updated successfully.",
    });
  };

  const handleReturnDecision = (status, comments) => {
    if (!selectedOrder) return;
    setPendingAction({
      status,
      comments,
      label: status === "RETURN_APPROVED"
        ? "Accept this return request? Stock will be restored once processed."
        : "Reject this return request? The customer will be notified.",
      successMessage: `Return request ${status === "RETURN_APPROVED" ? "accepted" : "rejected"}.`,
    });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction || !selectedOrder) return;
    setApplyingAction(true);
    try {
      const updated = await updateOrderStatus(selectedOrder.orderId, pendingAction.status, pendingAction.comments);
      setSelectedOrder(updated);
      setTransitionComments("");
      const historyData = await getOrderHistory(updated.orderId);
      setOrderHistory(historyData || []);
      if (onOrderUpdated) onOrderUpdated();
      toast.success(pendingAction.successMessage);
      setPendingAction(null);
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setApplyingAction(false);
    }
  };

  return (
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
            {orders.filter((o) =>
              ["PENDING", "SUCCESS", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)
            ).length}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Delivered Orders</p>
          <p className="text-2xl font-black text-emerald-800 mt-0.5">
            {orders.filter((o) => o.status === "DELIVERED").length}
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Cancelled / Returned</p>
          <p className="text-2xl font-black text-rose-800 mt-0.5">
            {orders.filter((o) =>
              ["CANCELLED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED", "ITEM_PICKED_UP", "RETURNED", "REFUNDED"].includes(o.status)
            ).length}
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
            onChange={(e) => setSearchOrder(e.target.value)}
            className="text-xs h-10 pl-10"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-350 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
            <option value="RETURN_APPROVED">RETURN_APPROVED</option>
            <option value="RETURN_REJECTED">RETURN_REJECTED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
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
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-800">{order.orderId}</td>
                    <td className="p-4 text-xs font-medium">Account ID: {order.userId}</td>
                    <td className="p-4 font-bold text-slate-900">₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.status === "RETURN_REQUESTED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : order.status === "RETURN_APPROVED"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : order.status === "RETURN_REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : order.status === "ITEM_PICKED_UP"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : order.status === "RETURNED" || order.status === "REFUNDED"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-semibold">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleInspect(order)}
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

      {/* Selected Order Details & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-150 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand" />
                  Order #{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-slate-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Items list & total */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Products</h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{item.productName || `Product ID: ${item.productId}`}</p>
                            <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{parseFloat(item.pricePerUnit).toFixed(2)}</p>
                          </div>
                          <span className="font-black text-slate-900">₹{parseFloat(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No line items detailed.</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Total Invoice Sum</span>
                    <span className="text-base font-black text-slate-900">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Right: Status Update Form */}
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
                          onClick={() => handleReturnDecision("RETURN_APPROVED", "Return request accepted by administrator.")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                        >
                          Accept Return
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReturnDecision("RETURN_REJECTED", "Return request rejected by administrator.")}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                        >
                          Reject Return
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleStatusTransitionSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Update Workflow Status</label>
                      <select
                        value={transitionStatus}
                        onChange={(e) => setTransitionStatus(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-350 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                        <option value="RETURN_REJECTED">RETURN_REJECTED</option>
                        <option value="ITEM_PICKED_UP">ITEM_PICKED_UP</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Remarks / Comments</label>
                      <Input
                        type="text"
                        placeholder="e.g. Dispatched via courier tracking #12345"
                        value={transitionComments}
                        onChange={(e) => setTransitionComments(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <Button type="submit" className="w-full text-xs font-bold h-9">
                      Apply Status Transition
                    </Button>
                  </form>

                  {/* Audit History Log */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit History</h4>
                    {historyLoading ? (
                      <p className="text-xs text-slate-400 italic">Loading timeline...</p>
                    ) : orderHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No transition logs.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {orderHistory.map((h, i) => (
                          <div key={i} className="text-xs p-2 bg-slate-50 border border-slate-150 rounded-lg">
                            <div className="flex justify-between font-semibold">
                              <span className="text-slate-800 font-bold">{h.status}</span>
                              <span className="text-[10px] text-slate-400">{new Date(h.changedAt).toLocaleString()}</span>
                            </div>
                            {h.comments && <p className="text-[11px] text-slate-600 mt-0.5">&quot;{h.comments}&quot;</p>}
                            <p className="text-[10px] text-slate-400 mt-0.5">By: {h.changedBy || "System"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title="Confirm status change"
        description={pendingAction?.label}
        confirmLabel="Confirm"
        loading={applyingAction}
        onConfirm={confirmPendingAction}
        onCancel={() => !applyingAction && setPendingAction(null)}
      />
    </div>
  );
}
