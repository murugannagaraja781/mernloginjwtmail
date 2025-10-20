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

  // ✅ Load items and orders
  const load = async () => {
    try {
      const it = await apiFetch("/items");
      if (Array.isArray(it)) setItems(it);
      const od = await apiFetch("/orders");
      if (od.orders) setOrdersData(od);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Add item
  const addItem = async () => {
    try {
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
    }
  };

  const deleteItem = async (id) => {
    try {
      await apiFetch(`/items/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuClick = async (id) => {
    if (id === "logout") {
      localStorage.clear();
      window.location.reload();
    } else {
      setActiveMenu(id);
      await load();
    }
  };

  // ✅ Chart (Growth / Revenue)
  const chartData = {
    labels: ordersData.orders.map((o) =>
      new Date(o.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Pluto Growth (Revenue ₹)",
        data: ordersData.orders.map((o) => o.total),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#4f46e5",
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const menuItems = [
    { id: "add-item", label: "Add Item" },
    { id: "revenue", label: "Growth Chart" },
    { id: "recent-sales", label: "Recent Sales" },
    { id: "product-list", label: "Product List" },
    { id: "logout", label: "Logout" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-indigo-600 text-white flex flex-col shadow-lg">
        <div className="p-5 text-center text-2xl font-bold tracking-wide border-b border-indigo-400">
          PLUTO Admin
        </div>
        <List className="flex-1 overflow-y-auto">
          {menuItems.map((m) => (
            <ListItem
              key={m.id}
              className={`cursor-pointer px-4 py-3 rounded-none ${
                activeMenu === m.id
                  ? "bg-indigo-500 text-white"
                  : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
              }`}
              onClick={() => handleMenuClick(m.id)}
            >
              {m.label}
            </ListItem>
          ))}
        </List>
        <div className="text-center text-xs text-indigo-200 py-2">
          © {new Date().getFullYear()} Pluto Café
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {successMsg && (
          <Alert color="green" className="mb-4 rounded-md shadow-md">
            {successMsg}
          </Alert>
        )}

        {/* Add Item */}
        {activeMenu === "add-item" && (
          <Card className="h-full shadow-md bg-white">
            <CardHeader
              floated={false}
              className="bg-indigo-600 text-white p-4 flex justify-between items-center"
            >
              <Typography variant="h5">Add New Product</Typography>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <Input
                label="Category"
                list="category-options"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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

              <Input
                type="number"
                label="Sell Price (₹)"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({ ...form, sellPrice: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                label="Cost Price (₹)"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                label="Stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
              />
              <Button color="indigo" fullWidth onClick={addItem}>
                Add Product
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Revenue Chart */}
        {activeMenu === "revenue" && (
          <Card className="h-full shadow-md bg-white">
            <CardHeader
              floated={false}
              className="bg-indigo-600 text-white p-4"
            >
              <Typography variant="h5">Pluto Growth Chart</Typography>
            </CardHeader>
            <CardBody>
              {ordersData.orders.length > 0 ? (
                <div className="w-full h-[60vh]">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: "#4f46e5" } },
                      },
                      scales: {
                        x: { ticks: { color: "#4f46e5" } },
                        y: { ticks: { color: "#4f46e5" } },
                      },
                    }}
                  />
                </div>
              ) : (
                <Typography>No growth data available.</Typography>
              )}
            </CardBody>
          </Card>
        )}

        {/* Recent Sales */}
        {activeMenu === "recent-sales" && (
          <Card className="h-full shadow-md bg-white">
            <CardHeader
              floated={false}
              className="bg-indigo-600 text-white p-4"
            >
              <Typography variant="h5">Recent Sales</Typography>
            </CardHeader>
            <CardBody className="space-y-3 max-h-[70vh] overflow-y-auto">
              {ordersData.orders.length > 0 ? (
                ordersData.orders.map((o) => (
                  <div
                    key={o._id}
                    className="border-b border-gray-200 pb-2 last:border-none"
                  >
                    <Typography variant="small" className="text-gray-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </Typography>
                    <Typography className="text-indigo-700 font-semibold">
                      Total: ₹{o.total}
                    </Typography>
                    {o.items.map((it, idx) => (
                      <Typography
                        key={idx}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {it.name} × {it.qty}
                      </Typography>
                    ))}
                  </div>
                ))
              ) : (
                <Typography>No sales recorded yet.</Typography>
              )}
            </CardBody>
          </Card>
        )}

        {/* Product List */}
        {activeMenu === "product-list" && (
          <Card className="h-full shadow-md bg-white">
            <CardHeader
              floated={false}
              className="bg-indigo-600 text-white p-4"
            >
              <Typography variant="h5">Product List</Typography>
            </CardHeader>
            <CardBody className="max-h-[70vh] overflow-y-auto space-y-6">
              {Object.entries(
                items.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {})
              ).map(([category, products]) => (
                <div key={category}>
                  <Typography
                    variant="h6"
                    className="font-semibold mb-2 text-indigo-700"
                  >
                    {category}
                  </Typography>
                  <List>
                    {products.map((i) => (
                      <ListItem
                        key={i._id}
                        className="flex justify-between items-center border-b border-gray-200"
                      >
                        <Typography>
                          {i.name} — ₹{i.sellPrice} (Stock: {i.stock})
                        </Typography>
                        <Button
                          color="red"
                          size="sm"
                          onClick={() => deleteItem(i._id)}
                        >
                          Delete
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
