import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { addCategory } from "@/api/admin";

export function AdminCategories({
  categoriesList = [],
  categoriesLoading = false,
  productsList = [],
  onCategoryAdded,
}) {
  const toast = useToast();
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getProductCountForCategory = (catName) => {
    return productsList.filter((p) => p.category === catName).length;
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSubmitting(true);
    try {
      await addCategory(categoryName.trim());
      setCategoryName("");
      toast.success("Category added.");
      if (onCategoryAdded) onCategoryAdded();
    } catch (err) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-up">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Categories</h2>
        <p className="text-xs text-slate-400">Group products so shoppers can browse them easily.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <Card className="border-slate-200 bg-white p-5 shadow-xs h-fit">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Add a category</h3>
          <p className="text-xs text-slate-400 mb-4">New categories appear in the store navigation right away.</p>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Name</label>
              <Input
                type="text"
                placeholder="e.g. Home & Kitchen"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="text-xs h-10"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-xs font-bold h-10 cursor-pointer"
            >
              {submitting ? "Registering..." : "Register Category"}
            </Button>
          </form>
        </Card>

        {/* Categories List */}
        <Card className="lg:col-span-2 border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">All categories</h3>
          <p className="text-xs text-slate-400 mb-4">Each category and how many products it holds.</p>

          {categoriesLoading ? (
            <div className="text-center py-10 text-slate-500 italic">Loading categories…</div>
          ) : categoriesList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No categories yet. Add your first one above.</div>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Category ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoriesList.map((c) => (
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
  );
}
