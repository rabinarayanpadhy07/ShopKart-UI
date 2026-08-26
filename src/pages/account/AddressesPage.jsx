import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [editId, setEditId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to load addresses");
      const data = await response.json();
      setAddresses(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart/items/count', {
        credentials: 'include',
      });
      if (response.ok) {
        const count = await response.json();
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchCartCount();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFullName("");
    setPhoneNumber("");
    setStreetAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setIsDefault(false);
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setEditId(addr.id);
    setFullName(addr.fullName);
    setPhoneNumber(addr.phoneNumber);
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setIsDefault(addr.default);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { fullName, phoneNumber, streetAddress, city, state, zipCode, default: isDefault };

    try {
      let response;
      if (editId) {
        response = await fetch(`/api/addresses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setShowForm(false);
        fetchAddresses();
      } else {
        alert("Error saving address details");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        fetchAddresses();
      } else {
        alert("Failed to delete address");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: "PUT",
        credentials: "include"
      });
      if (response.ok) {
        fetchAddresses();
      } else {
        alert("Failed to set default address");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
      <Header cartCount={cartCount} username={username} />
      <main className="flex-grow max-w-4xl mx-auto w-full py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Your Delivery Addresses</h1>
          {!showForm && (
            <Button onClick={handleOpenAdd} className="font-bold text-xs" size="sm">
              + Add New Address
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-center mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="bg-white mb-8 border-teal-500/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{editId ? "Edit Address" : "Add New Address"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <Input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                    <Input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-600">Street Address</label>
                  <Input type="text" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600">City</label>
                    <Input type="text" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600">State</label>
                    <Input type="text" value={state} onChange={e => setState(e.target.value)} required />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600">ZIP Code</label>
                    <Input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} required />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#00ABE4] focus:ring-[#00ABE4]"
                  />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-slate-700">Set as default delivery address</label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit">Save Address</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-10 text-slate-500">Loading addresses...</div>
        )}

        {!loading && !showForm && addresses.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-gray-150 p-8 shadow-xs">
            <p className="text-lg font-semibold">No addresses saved. Please add an address to proceed with orders.</p>
          </div>
        )}

        {!loading && !showForm && addresses.length > 0 && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <Card key={addr.id} className={`overflow-hidden bg-white border ${addr.default ? 'border-[#00ABE4] shadow-xs' : 'border-gray-200'}`}>
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-lg">{addr.fullName}</span>
                      {addr.default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E9F1FA] text-[#00ABE4] border border-[#00ABE4]/20">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                    <p className="text-xs text-slate-500">Phone: {addr.phoneNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!addr.default && (
                      <Button onClick={() => handleSetDefault(addr.id)} variant="outline" size="sm" className="text-xs font-bold">
                        Set Default
                      </Button>
                    )}
                    <Button onClick={() => handleOpenEdit(addr)} variant="outline" size="sm" className="text-xs font-bold">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(addr.id)} variant="destructive" size="sm" className="text-xs font-bold">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
