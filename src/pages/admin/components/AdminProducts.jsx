import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { IMAGE_FALLBACK } from "@/lib/placeholder";
import { getProducts } from "@/api/products";
import { addAdminProduct, modifyAdminProduct, deleteAdminProduct } from "@/api/admin";

export function AdminProducts({
  categoriesList = [],
  onProductMutated,
}) {
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null); // product being confirmed for deletion
  const [deleting, setDeleting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    productId: null,
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce search query input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim());
      setPage(0);
    }, 300);
  };

  // Fetch server-side paginated & filtered products
  const fetchProductsPage = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = {
        page: String(page),
        size: "10",
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      const data = await getProducts(params, { signal: controller.signal });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      if (err.name !== "AbortError" && !controller.signal.aborted) {
        console.error("Failed to load admin products:", err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProductsPage();
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProductsPage]);

  // Add / Edit submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        categoryId: parseInt(productForm.categoryId, 10),
        imageUrl: productForm.imageUrl,
      };

      if (modalMode === "add") {
        await addAdminProduct(payload);
        toast.success("Product added successfully.");
      } else {
        await modifyAdminProduct(productForm.productId, payload);
        toast.success("Product updated successfully.");
      }

      setIsModalOpen(false);
      fetchProductsPage();
      if (onProductMutated) onProductMutated();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(deleteTarget.product_id);
      toast.success("Product deleted successfully.");
      setDeleteTarget(null);
      fetchProductsPage();
      if (onProductMutated) onProductMutated();
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setProductForm({
      productId: null,
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: categoriesList[0]?.categoryId || "",
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    const firstImage = p.images && p.images[0] ? p.images[0] : "";
    const catObj = categoriesList.find((c) => c.categoryName === p.category);
    setModalMode("edit");
    setProductForm({
      productId: p.product_id,
      name: p.name,
      description: p.description || "",
      price: p.price ? p.price.toString() : "",
      stock: p.stock ? p.stock.toString() : "",
      categoryId: catObj ? catObj.categoryId : (categoriesList[0]?.categoryId || ""),
      imageUrl: firstImage,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Catalog Inventory</h2>
          <p className="text-xs text-slate-400">Server-side paginated inventory management ({totalItems} total products).</p>
        </div>
        <Button onClick={openAddModal} className="font-bold text-xs h-9 cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex bg-white border border-slate-205 p-4 rounded-2xl shadow-xs">
        <div className="flex-grow relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products by Name or Category..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="text-xs h-10 pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 italic">Compiling inventory page...</div>
      ) : products.length === 0 ? (
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
                {products.map((p) => {
                  const firstImage = p.images && p.images[0] ? p.images[0] : "";
                  return (
                    <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <img
                          src={firstImage || IMAGE_FALLBACK}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-150"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = IMAGE_FALLBACK;
                          }}
                        />
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 font-semibold">#{p.product_id}</td>
                      <td className="p-4 font-bold text-slate-800 max-w-xs truncate">{p.name}</td>
                      <td className="p-4 text-xs font-semibold text-slate-500">{p.category || "Uncategorized"}</td>
                      <td className="p-4 font-extrabold text-slate-900">₹{parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.stock <= 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : p.stock <= 10
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <Button
                          onClick={() => openEditModal(p)}
                          size="sm"
                          variant="outline"
                          className="text-[10px] font-bold h-8 cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(p)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-150 text-xs text-slate-600 bg-slate-50/50">
              <span>
                Page <strong className="text-slate-800">{page + 1}</strong> of <strong>{totalPages}</strong> ({totalItems} items)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === "add" ? "Create New Product" : `Edit Product #${productForm.productId}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed product features and specifications..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-350 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="1999.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  required
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-350 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <Input
                  type="url"
                  placeholder="https://images.example.com/item.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 text-xs font-bold h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 text-xs font-bold h-10 cursor-pointer"
                >
                  {formSubmitting ? "Saving..." : modalMode === "add" ? "Create Product" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this product?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the catalog. This cannot be undone.` : ''}
        confirmLabel="Delete Product"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
