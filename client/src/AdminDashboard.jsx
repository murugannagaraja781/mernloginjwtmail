import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Typography,
  List,
  ListItem,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { Line } from "react-chartjs-2";
import { apiFetch } from "./api";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("add-item");
  const [items, setItems] = useState([]);
  const [ordersData, setOrdersData] = useState({ orders: [] });
  const [form, setForm] = useState({
    name: "",
    category: "",
    sellPrice: "",
    costPrice: "",
    stock: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState({
    items: false,
    orders: false,
    action: false,
  });

  // ✅ Load items and orders
  const load = async () => {
    try {
      setLoading((prev) => ({ ...prev, items: true, orders: true }));

      const [it, od] = await Promise.all([
        apiFetch("/items"),
        apiFetch("/orders"),
      ]);

      if (Array.isArray(it)) setItems(it);
      if (od.orders) setOrdersData(od);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, items: false, orders: false }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Add item
  const addItem = async () => {
    if (!form.name || !form.category || !form.sellPrice) {
      setSuccessMsg("❌ Please fill all required fields");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, action: true }));
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res._id) {
        setSuccessMsg("✅ Item added successfully!");
        setTimeout(() => setSuccessMsg(""), 2500);
        setForm({
          name: "",
          category: "",
          sellPrice: "",
          costPrice: "",
          stock: "",
        });
        await load();
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("❌ Failed to add item");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading((prev) => ({ ...prev, action: true }));
      await apiFetch(`/items/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err);
      setSuccessMsg("❌ Failed to delete item");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleMenuClick = async (id) => {
    if (id === "logout") {
      localStorage.clear();
      window.location.reload();
    } else {
      setActiveMenu(id);
      if (id === "revenue" || id === "recent-sales" || id === "product-list") {
        await load();
      }
    }
  };

  // ✅ Chart Data with professional colors
  const chartData = {
    labels: ordersData.orders.map((o) =>
      new Date(o.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Revenue Trend (₹)",
        data: ordersData.orders.map((o) => o.total),
        fill: true,
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        borderColor: "#4f46e5",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "#4f46e5",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const menuItems = [
    { id: "add-item", label: "Add Product", icon: "➕" },
    { id: "revenue", label: "Revenue Analytics", icon: "📊" },
    { id: "recent-sales", label: "Recent Sales", icon: "🛒" },
    { id: "product-list", label: "Inventory", icon: "📦" },
    { id: "logout", label: "Logout", icon: "🚪" },
  ];

  // Calculate total revenue
  const totalRevenue = ordersData.orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Sidebar - Professional Dark Theme */}
      <div className="w-full md:w-64 bg-slate-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-slate-700">
          <Typography variant="h4" className="font-bold text-white mb-2">
            Pluto Admin
          </Typography>
          <Typography variant="small" className="text-slate-300">
            Restaurant Management
          </Typography>
        </div>

        {/* Stats Overview */}
        <div className="p-4 border-b border-slate-700">
          <div className="bg-slate-700 rounded-lg p-3">
            <Typography variant="small" className="text-slate-300">
              Total Revenue
            </Typography>
            <Typography variant="h6" className="text-white font-bold">
              ₹{totalRevenue.toLocaleString()}
            </Typography>
          </div>
        </div>

        <List className="flex-1 p-4 space-y-2">
          {menuItems.map((m) => (
            <ListItem
              key={m.id}
              className={`cursor-pointer rounded-lg transition-all duration-200 ${
                activeMenu === m.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => handleMenuClick(m.id)}
            >
              <span className="mr-3">{m.icon}</span>
              {m.label}
            </ListItem>
          ))}
        </List>

        <div className="text-center text-sm text-slate-400 p-4 border-t border-slate-700">
          © {new Date().getFullYear()} Pluto Café
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {successMsg && (
          <Alert
            color={successMsg.includes("❌") ? "red" : "green"}
            className="mb-6 rounded-lg shadow-lg border-l-4"
          >
            {successMsg}
          </Alert>
        )}

        {/* Add Item */}
        {activeMenu === "add-item" && (
          <Card className="shadow-xl border-0">
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg"
            >
              <Typography variant="h4" className="flex items-center gap-2">
                📦 Add New Product
              </Typography>
              <Typography variant="small" className="text-blue-100">
                Add new items to your menu
              </Typography>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white"
                />

                <div>
                  <Input
                    label="Category *"
                    list="category-options"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="bg-white"
                  />
                  <datalist id="category-options">
                    <option value="Fresh Juices" />
                    <option value="Milkshakes" />
                    <option value="Lassi" />
                    <option value="Specials" />
                    <option value="Sandwiches" />
                    <option value="Burgers" />
                    <option value="Pasta" />
                    <option value="Mocktails" />
                    <option value="Drinks" />
                    <option value="Hot Beverages" />
                    <option value="Chocolate Specials" />
                  </datalist>
                </div>

                <Input
                  type="number"
                  label="Sell Price (₹) *"
                  value={form.sellPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellPrice: Number(e.target.value) })
                  }
                  className="bg-white"
                />
                <Input
                  type="number"
                  label="Cost Price (₹)"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: Number(e.target.value) })
                  }
                  className="bg-white"
                />
                <Input
                  type="number"
                  label="Stock Quantity"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="bg-white"
                />
              </div>

              <Button
                color="blue"
                size="lg"
                onClick={addItem}
                disabled={loading.action}
                className="flex items-center justify-center gap-2 mt-4"
              >
                {loading.action ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Adding Product...
                  </>
                ) : (
                  "➕ Add Product"
                )}
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Revenue Chart */}
        {activeMenu === "revenue" && (
          <Card className="shadow-xl border-0">
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg"
            >
              <Typography variant="h4" className="flex items-center gap-2">
                📊 Revenue Analytics
              </Typography>
              <Typography variant="small" className="text-green-100">
                Track your business growth and revenue trends
              </Typography>
            </CardHeader>
            <CardBody className="p-6">
              {loading.orders ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner className="h-8 w-8" />
                  <Typography variant="h6" className="ml-3">
                    Loading revenue data...
                  </Typography>
                </div>
              ) : ordersData.orders.length > 0 ? (
                <div className="w-full h-[60vh]">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: "#374151",
                            font: { size: 14, weight: "bold" },
                          },
                        },
                        tooltip: {
                          backgroundColor: "#1f2937",
                          titleColor: "#f9fafb",
                          bodyColor: "#f9fafb",
                          borderColor: "#4f46e5",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#6b7280" },
                          grid: { color: "rgba(0,0,0,0.1)" },
                        },
                        y: {
                          ticks: { color: "#6b7280" },
                          grid: { color: "rgba(0,0,0,0.1)" },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Typography variant="h6" color="gray" className="mb-2">
                    No revenue data available
                  </Typography>
                  <Typography variant="small" color="gray">
                    Start making sales to see your revenue trends
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Recent Sales */}
        {activeMenu === "recent-sales" && (
          <Card className="shadow-xl border-0">
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg"
            >
              <Typography variant="h4" className="flex items-center gap-2">
                🛒 Recent Sales
              </Typography>
              <Typography variant="small" className="text-purple-100">
                Latest orders and transactions
              </Typography>
            </CardHeader>
            <CardBody className="p-6">
              {loading.orders ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner className="h-8 w-8" />
                  <Typography variant="h6" className="ml-3">
                    Loading sales data...
                  </Typography>
                </div>
              ) : ordersData.orders.length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {ordersData.orders.map((o) => (
                    <Card
                      key={o._id}
                      className="border-l-4 border-l-purple-500 shadow-sm"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Typography
                              variant="small"
                              className="text-gray-600"
                            >
                              {new Date(o.createdAt).toLocaleString()}
                            </Typography>
                            <Typography className="text-purple-700 font-bold text-lg">
                              ₹{o.total}
                            </Typography>
                            <div className="mt-2 space-y-1">
                              {o.items.map((it, idx) => (
                                <Typography
                                  key={idx}
                                  className="text-sm text-gray-700"
                                >
                                  • {it.name} × {it.qty} - ₹{it.price * it.qty}
                                </Typography>
                              ))}
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Completed
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Typography variant="h6" color="gray" className="mb-2">
                    No sales recorded yet
                  </Typography>
                  <Typography variant="small" color="gray">
                    Your sales will appear here
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Product List */}
        {activeMenu === "product-list" && (
          <Card className="shadow-xl border-0">
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-lg"
            >
              <Typography variant="h4" className="flex items-center gap-2">
                📦 Inventory Management
              </Typography>
              <Typography variant="small" className="text-orange-100">
                Manage your products and stock levels
              </Typography>
            </CardHeader>
            <CardBody className="p-6">
              {loading.items ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner className="h-8 w-8" />
                  <Typography variant="h6" className="ml-3">
                    Loading inventory...
                  </Typography>
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {Object.entries(
                    items.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {})
                  ).map(([category, products]) => (
                    <div
                      key={category}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <Typography
                        variant="h5"
                        className="font-bold mb-3 text-gray-800 bg-gray-50 p-2 rounded-lg"
                      >
                        {category} ({products.length})
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {products.map((i) => (
                          <Card
                            key={i._id}
                            className="border-l-4 border-l-orange-500"
                          >
                            <CardBody className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <Typography
                                    variant="h6"
                                    className="font-semibold text-gray-800"
                                  >
                                    {i.name}
                                  </Typography>
                                  <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-green-600 font-semibold">
                                      ₹{i.sellPrice}
                                    </span>
                                    {i.costPrice && (
                                      <span className="text-gray-500">
                                        Cost: ₹{i.costPrice}
                                      </span>
                                    )}
                                    <span
                                      className={`font-semibold ${
                                        i.stock < 10
                                          ? "text-red-600"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      Stock: {i.stock}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  color="red"
                                  size="sm"
                                  onClick={() => deleteItem(i._id)}
                                  disabled={loading.action}
                                  className="ml-2"
                                >
                                  {loading.action ? (
                                    <Spinner className="h-4 w-4" />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Typography variant="h6" color="gray" className="mb-2">
                    No products found
                  </Typography>
                  <Typography variant="small" color="gray">
                    Add your first product to get started
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
