import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const CustomModal = ({ modalType, onClose, onSubmit, response, initialUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const [inputValue, setInputValue] = useState(""); // Generalized input for all cases
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    if (modalType === "addProduct") {
      fetch("/api/products/categories")
        .then(res => res.json())
        .then(data => setDbCategories(data || []))
        .catch(err => console.error("Error fetching categories:", err));
    }
  }, [modalType]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneralInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData(e.target);
    switch (modalType) {
      case "addProduct": {
        const processedData = {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          categoryId: parseInt(formData.categoryId, 10),
        };
        onSubmit(processedData);
        break;
      }
      case "deleteProduct": {
        const productId = parseInt(inputValue, 10);
        onSubmit({ productId });
        break;
      }
      case "viewUser": {
        const userId = parseInt(inputValue, 10);
        onSubmit({ userId });
        break;
      }
      case "modifyUser": {
        const username = formDataObj.get("username");
        const email = formDataObj.get("email");
        const role = formDataObj.get("role");
        const userId = parseInt(inputValue, 10);
        onSubmit({ userId, username, email, role });
        break;
      }
      case "monthlyBusiness": {
        const monthYearVal = formDataObj.get("monthYear");
        if (monthYearVal) {
          const [yearStr, monthStr] = monthYearVal.split("-");
          onSubmit({ month: parseInt(monthStr, 10), year: parseInt(yearStr, 10) });
        }
        break;
      }
      case "dailyBusiness": {
        const date = formDataObj.get("date");
        onSubmit({ date });
        break;
      }
      case "yearlyBusiness": {
        const year = parseInt(formDataObj.get("year"), 10);
        onSubmit({ year });
        break;
      }
      case "overallBusiness": {
        onSubmit();
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 p-6 space-y-6">
        
        {/* Add Product Form */}
        {modalType === "addProduct" &&
          (!response ? (
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">Add Product</h2>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1 text-left">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="name">Name:</label>
                  <Input type="text" id="name" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="price">Price:</label>
                    <Input type="number" id="price" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="stock">Stock:</label>
                    <Input type="number" id="stock" name="stock" placeholder="Stock" value={formData.stock} onChange={handleInputChange} required />
                  </div>
                </div>
                 <div className="space-y-1 text-left">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="categoryId">Category ID:</label>
                  <Input type="number" id="categoryId" name="categoryId" placeholder="Category ID (e.g. 1)" value={formData.categoryId} onChange={handleInputChange} required />
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    <strong>Category ID Mappings:</strong>{" "}
                    {dbCategories.length > 0
                      ? dbCategories.map(c => `${c.categoryId}: ${c.categoryName}`).join(", ")
                      : "Loading categories..."}
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="imageUrl">Image URL:</label>
                  <Input type="text" id="imageUrl" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00ABE4] focus:border-[#00ABE4] transition-colors"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">Product Added</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-4">
                <img src={response.imageUrl} alt="product" className="h-32 w-32 rounded-lg object-cover bg-slate-50 border border-gray-150" />
                <div className="space-y-2 text-sm text-slate-600 flex-grow text-center sm:text-left">
                  <p><strong>Name:</strong> {response?.product?.name}</p>
                  <p><strong>Description:</strong> {response?.product?.description}</p>
                  <p><strong>Price:</strong> ₹{parseFloat(response?.product?.price).toFixed(2)}</p>
                  <p><strong>Stock:</strong> {response?.product?.stock}</p>
                  <p><strong>Category:</strong> {response?.product?.category?.categoryName}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={onClose}>Close</Button>
              </div>
            </>
          ))}

        {/* Delete Product Form */}
        {modalType === "deleteProduct" &&
          (!response ? (
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">Delete Product</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-sm font-semibold text-slate-700">Product ID:</label>
                  <Input
                    type="number"
                    placeholder="Enter Product ID to delete"
                    value={inputValue}
                    onChange={handleGeneralInputChange}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="destructive">Delete</Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center py-6 space-y-4">
                {response.error ? (
                  <>
                    <div className="text-4xl text-red-500">✗</div>
                    <h2 className="text-2xl font-bold text-slate-800">Failed to Delete Product</h2>
                    <p className="text-sm text-slate-500">{response.error}</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl text-green-500">✓</div>
                    <h2 className="text-2xl font-bold text-slate-800">{response.message || "Product Deleted Successfully"}</h2>
                  </>
                )}
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={onClose}>Close</Button>
              </div>
            </>
          ))}

        {/* View User Details Form */}
        {modalType === "viewUser" && (
          <>
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-bold text-slate-800">View User Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-sm font-semibold text-slate-700">User ID:</label>
                <Input
                  type="number"
                  placeholder="Enter User ID"
                  value={inputValue}
                  onChange={handleGeneralInputChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </>
        )}

        {/* Response Display */}
        {modalType === "response" && response && (
          <>
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-bold text-slate-800">User Profile Details</h2>
            </div>
            {response.user ? (
              <div className="space-y-3 text-sm text-slate-700 py-3 text-left">
                <p className="border-b border-gray-100 pb-1"><strong>User ID:</strong> <span className="font-semibold">{response.user.userId}</span></p>
                <p className="border-b border-gray-100 pb-1"><strong>Username:</strong> <span className="font-semibold">{response.user.username}</span></p>
                <p className="border-b border-gray-100 pb-1"><strong>Email:</strong> <span className="font-semibold">{response.user.email}</span></p>
                <p className="border-b border-gray-100 pb-1"><strong>Role:</strong> <span className="font-semibold">{response.user.role}</span></p>
                <p className="border-b border-gray-100 pb-1"><strong>Created At:</strong> <span className="font-semibold">{new Date(response.user.createdAt).toLocaleString()}</span></p>
                <p className="border-b border-gray-100 pb-1"><strong>Updated At:</strong> <span className="font-semibold">{new Date(response.user.updatedAt).toLocaleString()}</span></p>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 rounded-lg p-4 border border-red-150 text-center">
                <p>{response.message || "Failed to load details"}</p>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button onClick={onClose}>Back to Dashboard</Button>
            </div>
          </>
        )}

        {/* Analytics Modals (Monthly, Daily, Yearly, Overall Business) */}
        {(modalType === "monthlyBusiness" || modalType === "dailyBusiness" || modalType === "yearlyBusiness" || modalType === "overallBusiness") && (
          <>
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-bold text-slate-800">
                {modalType === "monthlyBusiness" && "Monthly Financials"}
                {modalType === "dailyBusiness" && "Daily Financials"}
                {modalType === "yearlyBusiness" && "Yearly Financials"}
                {modalType === "overallBusiness" && "Overall Financials"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!response && (
                <>
                  {modalType === "monthlyBusiness" && (
                    <div className="space-y-1 text-left">
                      <label className="text-sm font-semibold text-slate-700">Select Month & Year:</label>
                      <Input type="month" id="monthYear" name="monthYear" required />
                    </div>
                  )}
                  {modalType === "dailyBusiness" && (
                    <div className="space-y-1 text-left">
                      <label className="text-sm font-semibold text-slate-700">Select Date:</label>
                      <Input type="date" id="date" name="date" required />
                    </div>
                  )}
                  {modalType === "yearlyBusiness" && (
                    <div className="space-y-1 text-left">
                      <label className="text-sm font-semibold text-slate-700">Select Year:</label>
                      <select id="year" name="year" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ABE4] focus:border-[#00ABE4]">
                        {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {modalType === "overallBusiness" && (
                    <div className="text-center py-4">
                      <p className="text-slate-600">Retrieve global business data since inception.</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </>
              )}

              {response && (
                <div className="space-y-4">
                  {response.error || response.message ? (
                    <div className="bg-red-50 text-red-600 rounded-lg p-4 border border-red-150 text-center">
                      <p>{response.error || response.message}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center border border-gray-150">
                        <span className="text-sm font-bold text-slate-700">Total Business Value</span>
                        <span className="text-xl font-extrabold text-slate-900">
                          ₹{(
                            response.totalBusiness !== undefined ? response.totalBusiness : 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-1">Category breakdown sales:</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {Object.entries(
                            response.categorySales || {}
                          ).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className="text-slate-600">{cat}</span>
                              <span className="font-semibold text-slate-800">{val} sales</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="button" onClick={onClose}>Close</Button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}

        {/* ModifyUser */}
        {modalType === "modifyUser" && (
          <ModifyUserFormComponent onClose={onClose} initialUser={initialUser} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};

export default CustomModal;

const ModifyUserFormComponent = ({ onClose, initialUser, onSuccess }) => {
  const [userId, setUserId] = useState(initialUser?.userId || "");
  const [userDetails, setUserDetails] = useState(initialUser || null);
  const [updated, setUpdated] = useState(false);

  const handleFetchUser = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const userid = formData.get("user-id");

      if (!userid) return;

      const response = await fetch(`/admin/users/${userid}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        setUserDetails(user);
        setUserId(userid);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "Failed to find user");
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const role = formData.get("role");

    try {
      const response = await fetch(`/admin/users/modify/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          role,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        setUpdated(true);
        setUserDetails(user);
        if (onSuccess) onSuccess();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user details", error);
    }
  };

  if (!userDetails) {
    return (
      <>
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-bold text-slate-800 text-left">Modify User</h2>
        </div>
        <form onSubmit={handleFetchUser} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-sm font-semibold text-slate-700" htmlFor="user-id">User ID:</label>
            <Input
              type="text"
              id="user-id"
              name="user-id"
              placeholder="Enter User ID to modify"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Get User</Button>
          </div>
        </form>
      </>
    );
  }

  if (userDetails && !updated) {
    return (
      <>
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-bold text-slate-800 text-left">Modify User Profile</h2>
        </div>
        <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="user-id-disabled">User ID:</label>
            <Input
              type="text"
              id="user-id-disabled"
              name="user-id"
              value={userId}
              readOnly
              className="bg-slate-50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="username">Username:</label>
            <Input
              type="text"
              id="username"
              name="username"
              defaultValue={userDetails?.username}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email:</label>
            <Input
              type="email"
              id="email"
              name="email"
              defaultValue={userDetails?.email}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="role">Role:</label>
            <Input
              type="text"
              id="role"
              name="role"
              defaultValue={userDetails.role}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setUserDetails(null)}>Back</Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </>
    );
  }

  if (updated) {
    return (
      <>
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-bold text-slate-800 text-left">User Updated Successfully</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-700 py-3 text-left">
          <p className="border-b border-gray-100 pb-1"><strong>User ID:</strong> <span className="font-semibold">{userDetails.userId}</span></p>
          <p className="border-b border-gray-100 pb-1"><strong>Username:</strong> <span className="font-semibold">{userDetails.username}</span></p>
          <p className="border-b border-gray-100 pb-1"><strong>Email:</strong> <span className="font-semibold">{userDetails.email}</span></p>
          <p className="border-b border-gray-100 pb-1"><strong>Role:</strong> <span className="font-semibold">{userDetails.role}</span></p>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={onClose}>Close</Button>
        </div>
      </>
    );
  }
  return <></>;
};
