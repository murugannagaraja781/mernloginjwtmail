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
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { apiFetch } from "./api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
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
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: "",
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
      setSuccessMsg("✅ Item deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 2500);
      await load();
    } catch (err) {
      console.error(err);
      setSuccessMsg("❌ Failed to delete item");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const deleteCategory = async (category) => {
    try {
      setLoading((prev) => ({ ...prev, action: true }));
      // Delete all items in this category
      const categoryItems = items.filter((item) => item.category === category);
      await Promise.all(
        categoryItems.map((item) =>
          apiFetch(`/items/${item._id}`, { method: "DELETE" })
        )
      );
      setSuccessMsg(
        `✅ Category "${category}" and all its items deleted successfully!`
      );
      setTimeout(() => setSuccessMsg(""), 3000);
      setDeleteDialog({ open: false, category: "" });
      await load();
    } catch (err) {
      console.error(err);
      setSuccessMsg("❌ Failed to delete category");
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
      if (id !== "add-item") {
        await load();
      }
    }
  };

  // ✅ Calculate statistics
  const totalRevenue = ordersData.orders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const totalOrders = ordersData.orders.length;
  const totalProducts = items.length;
  const lowStockItems = items.filter((item) => item.stock < 10).length;

  // ✅ Get unique categories
  const categories = [...new Set(items.map((item) => item.category))];

  // ✅ Revenue Chart Data - Fixed with proper date handling
  const getRevenueChartData = () => {
    // Sort orders by date and get last 7 days
    const sortedOrders = [...ordersData.orders]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-7);

    return {
      labels: sortedOrders.map((o) =>
        new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      ),
      datasets: [
        {
          label: "Daily Revenue (₹)",
          data: sortedOrders.map((o) => o.total),
          fill: true,
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          borderColor: "#4f46e5",
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: "#4f46e5",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  };

  // ✅ Category-wise Sales Chart
  const getCategoryChartData = () => {
    const categorySales = {};

    ordersData.orders.forEach((order) => {
      order.items.forEach((item) => {
        const itemData = items.find((i) => i._id === item.itemId);
        if (itemData) {
          categorySales[itemData.category] =
            (categorySales[itemData.category] || 0) + item.sellPrice * item.qty;
        }
      });
    });

    return {
      labels: Object.keys(categorySales),
      datasets: [
        {
          label: "Sales by Category (₹)",
          data: Object.values(categorySales),
          backgroundColor: [
            "#4f46e5",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#06b6d4",
            "#84cc16",
            "#f97316",
            "#ec4899",
            "#64748b",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  };

  // ✅ Stock Distribution Chart
  const getStockChartData = () => {
    const stockRanges = {
      "Out of Stock": items.filter((i) => i.stock === 0).length,
      "Low Stock (1-10)": items.filter((i) => i.stock > 0 && i.stock <= 10)
        .length,
      "In Stock (11-50)": items.filter((i) => i.stock > 10 && i.stock <= 50)
        .length,
      "Well Stocked (50+)": items.filter((i) => i.stock > 50).length,
    };

    return {
      labels: Object.keys(stockRanges),
      datasets: [
        {
          data: Object.values(stockRanges),
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#4f46e5"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "add-item", label: "Add Product", icon: "➕" },
    { id: "revenue", label: "Revenue Analytics", icon: "💰" },
    { id: "recent-sales", label: "Recent Sales", icon: "🛒" },
    { id: "product-list", label: "Inventory", icon: "📦" },
    { id: "category-management", label: "Category Management", icon: "🏷️" },
    { id: "logout", label: "Logout", icon: "🚪" },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: { size: 12, weight: "bold" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: "#4f46e5",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
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
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: "60%",
  };

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
        <div className="p-4 border-b border-slate-700 space-y-3">
          <div className="bg-slate-700 rounded-lg p-3">
            <Typography variant="small" className="text-slate-300">
              Total Revenue
            </Typography>
            <Typography variant="h6" className="text-white font-bold">
              ₹{totalRevenue.toLocaleString()}
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700 rounded-lg p-2 text-center">
              <Typography variant="small" className="text-slate-300">
                Orders
              </Typography>
              <Typography variant="h6" className="text-white font-bold">
                {totalOrders}
              </Typography>
            </div>
            <div className="bg-slate-700 rounded-lg p-2 text-center">
              <Typography variant="small" className="text-slate-300">
                Products
              </Typography>
              <Typography variant="h6" className="text-white font-bold">
                {totalProducts}
              </Typography>
            </div>
          </div>
          {lowStockItems > 0 && (
            <div className="bg-red-500/20 rounded-lg p-2 text-center border border-red-500/30">
              <Typography variant="small" className="text-red-300">
                Low Stock Items
              </Typography>
              <Typography variant="h6" className="text-red-300 font-bold">
                {lowStockItems}
              </Typography>
            </div>
          )}
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

        {/* Dashboard Overview */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardBody className="p-6">
                  <Typography variant="h3" className="font-bold mb-2">
                    ₹{totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="small" className="text-blue-100">
                    Total Revenue
                  </Typography>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardBody className="p-6">
                  <Typography variant="h3" className="font-bold mb-2">
                    {totalOrders}
                  </Typography>
                  <Typography variant="small" className="text-green-100">
                    Total Orders
                  </Typography>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardBody className="p-6">
                  <Typography variant="h3" className="font-bold mb-2">
                    {totalProducts}
                  </Typography>
                  <Typography variant="small" className="text-purple-100">
                    Total Products
                  </Typography>
                </CardBody>
              </Card>

              <Card
                className={`${
                  lowStockItems > 0
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-gray-500 to-gray-600"
                } text-white`}
              >
                <CardBody className="p-6">
                  <Typography variant="h3" className="font-bold mb-2">
                    {lowStockItems}
                  </Typography>
                  <Typography variant="small" className="text-gray-100">
                    Low Stock Items
                  </Typography>
                </CardBody>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="shadow-xl">
                <CardHeader
                  floated={false}
                  shadow={false}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg"
                >
                  <Typography variant="h5">
                    Revenue Trend (Last 7 Days)
                  </Typography>
                </CardHeader>
                <CardBody className="p-4 h-80">
                  {loading.orders ? (
                    <div className="flex justify-center items-center h-full">
                      <Spinner className="h-8 w-8" />
                    </div>
                  ) : ordersData.orders.length > 0 ? (
                    <Line data={getRevenueChartData()} options={chartOptions} />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      No revenue data available
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Category Sales */}
              <Card className="shadow-xl">
                <CardHeader
                  floated={false}
                  shadow={false}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-lg"
                >
                  <Typography variant="h5">Sales by Category</Typography>
                </CardHeader>
                <CardBody className="p-4 h-80">
                  {loading.orders || loading.items ? (
                    <div className="flex justify-center items-center h-full">
                      <Spinner className="h-8 w-8" />
                    </div>
                  ) : ordersData.orders.length > 0 ? (
                    <Doughnut
                      data={getCategoryChartData()}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      No sales data available
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Stock Distribution */}
              <Card className="shadow-xl lg:col-span-2">
                <CardHeader
                  floated={false}
                  shadow={false}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-t-lg"
                >
                  <Typography variant="h5">Stock Distribution</Typography>
                </CardHeader>
                <CardBody className="p-4 h-80">
                  {loading.items ? (
                    <div className="flex justify-center items-center h-full">
                      <Spinner className="h-8 w-8" />
                    </div>
                  ) : items.length > 0 ? (
                    <Bar data={getStockChartData()} options={chartOptions} />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      No products available
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
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
                  <Select
                    label="Category *"
                    value={form.category}
                    onChange={(value) => setForm({ ...form, category: value })}
                  >
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
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

        {/* Revenue Analytics */}
        {activeMenu === "revenue" && (
          <div className="space-y-6">
            <Card className="shadow-xl">
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
                  <div className="w-full h-96">
                    <Line data={getRevenueChartData()} options={chartOptions} />
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
          </div>
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
                                  • {it.name} × {it.qty} - ₹
                                  {it.sellPrice * it.qty}
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
                      <div className="flex justify-between items-center mb-3">
                        <Typography
                          variant="h5"
                          className="font-bold text-gray-800 bg-gray-50 p-2 rounded-lg"
                        >
                          {category} ({products.length})
                        </Typography>
                      </div>
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
                                        i.stock === 0
                                          ? "text-red-600"
                                          : i.stock < 10
                                          ? "text-orange-600"
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

        {/* Category Management */}
        {activeMenu === "category-management" && (
          <Card className="shadow-xl border-0">
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-lg"
            >
              <Typography variant="h4" className="flex items-center gap-2">
                🏷️ Category Management
              </Typography>
              <Typography variant="small" className="text-teal-100">
                Manage product categories
              </Typography>
            </CardHeader>
            <CardBody className="p-6">
              {loading.items ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner className="h-8 w-8" />
                  <Typography variant="h6" className="ml-3">
                    Loading categories...
                  </Typography>
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const categoryItems = items.filter(
                      (item) => item.category === category
                    );
                    const categoryRevenue = ordersData.orders.reduce(
                      (total, order) => {
                        order.items.forEach((item) => {
                          const itemData = items.find(
                            (i) => i._id === item.itemId
                          );
                          if (itemData && itemData.category === category) {
                            total += item.sellPrice * item.qty;
                          }
                        });
                        return total;
                      },
                      0
                    );

                    return (
                      <Card
                        key={category}
                        className="border-l-4 border-l-teal-500"
                      >
                        <CardBody className="p-4">
                          <Typography
                            variant="h6"
                            className="font-bold text-gray-800 mb-2"
                          >
                            {category}
                          </Typography>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Products:</span>
                              <span className="font-semibold">
                                {categoryItems.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-semibold text-green-600">
                                ₹{categoryRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Low Stock:</span>
                              <span className="font-semibold text-orange-600">
                                {
                                  categoryItems.filter((i) => i.stock < 10)
                                    .length
                                }
                              </span>
                            </div>
                          </div>
                          <Button
                            color="red"
                            size="sm"
                            fullWidth
                            className="mt-3"
                            onClick={() =>
                              setDeleteDialog({ open: true, category })
                            }
                            disabled={loading.action}
                          >
                            {loading.action ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              "Delete Category"
                            )}
                          </Button>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Typography variant="h6" color="gray" className="mb-2">
                    No categories found
                  </Typography>
                  <Typography variant="small" color="gray">
                    Add products to create categories
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Delete Category Dialog */}
      <Dialog
        open={deleteDialog.open}
        handler={() => setDeleteDialog({ open: false, category: "" })}
      >
        <DialogHeader>Delete Category</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to delete the category "
            {deleteDialog.category}"? This will also delete all products in this
            category. This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteDialog({ open: false, category: "" })}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => deleteCategory(deleteDialog.category)}
            disabled={loading.action}
          >
            {loading.action ? (
              <Spinner className="h-4 w-4" />
            ) : (
              "Delete Category"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
