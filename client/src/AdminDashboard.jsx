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
  Alert, // ✅ Added Material Tailwind Alert
} from "@material-tailwind/react";
import { Line } from "react-chartjs-2";
import { apiFetch } from "./api";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("add-item");
  const [items, setItems] = useState([]);
  const [ordersData, setOrdersData] = useState({
    orders: [],
    revenue: 0,
    cost: 0,
    profit: 0,
  });
  const [form, setForm] = useState({
    name: "",
    category: "",
    sellPrice: "",
    costPrice: "",
    stock: "",
  });

  const [successMsg, setSuccessMsg] = useState(""); // ✅ Success message state

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

  const addItem = async () => {
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (res._id) {
        // ✅ Show Material success alert
        setSuccessMsg("Item added successfully!");
        setTimeout(() => setSuccessMsg(""), 2500); // Hide after 2.5s

        // Reset form
        setForm({
          name: "",
          category: "",
          sellPrice: "",
          costPrice: "",
          stock: "",
        });

        // ✅ Reload data (trigger GET again)
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

  const menuItems = [
    { id: "add-item", label: "Add Item" },
    { id: "revenue", label: "Revenue Chart" },
    { id: "recent-sales", label: "Recent Sales" },
    { id: "product-list", label: "Product List" },
    { id: "logout", label: "Logout" },
  ];

  const chartData = {
    labels: ordersData.orders.map((o) =>
      new Date(o.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Revenue",
        data: ordersData.orders.map((o) => o.total),
        fill: false,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const handleMenuClick = async (id) => {
    if (id === "logout") {
      localStorage.clear();
      window.location.reload();
    } else {
      setActiveMenu(id);
      await load(); // ✅ Reload data whenever menu is clicked
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        style={{ backgroundColor: "lightblue" }}
        className="w-60 text-white flex flex-col"
      >
        <div className="p-4 text-xl font-bold text-center text-blue-gray-900">
          Admin Panel
        </div>
        <List>
          {menuItems.map((m) => (
            <ListItem
              key={m.id}
              className={`cursor-pointer ${
                activeMenu === m.id ? "bg-blue-600 text-white" : "text-black"
              } hover:bg-blue-500 hover:text-white transition-colors`}
              onClick={() => handleMenuClick(m.id)}
            >
              {m.label}
            </ListItem>
          ))}
        </List>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 bg-gray-50">
        {/* ✅ Success Toast */}
        {successMsg && (
          <Alert color="green" className="rounded-md shadow-md">
            {successMsg}
          </Alert>
        )}

        {/* Add Item */}
        {activeMenu === "add-item" && (
          <Card>
            <CardHeader color="green" className="pb-0">
              <Typography variant="h5">Add Item</Typography>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="relative">
                <Input
                  label="Category"
                  list="category-options"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
                <datalist id="category-options">
                  <option value="Fresh Juices" />
                  <option value="Veg & Herbal Juices" />
                  <option value="Milkshakes" />
                  <option value="Lassi" />
                  <option value="Specials" />
                  <option value="Sandwiches" />
                  <option value="Burgers" />
                  <option value="Maggie & Pasta" />
                  <option value="Egg Items" />
                  <option value="Salads" />
                  <option value="Quick Bites" />
                  <option value="Chaats" />
                  <option value="Bun Specials" />
                  <option value="Mocktails" />
                  <option value="Drinks" />
                  <option value="Hot Beverages" />
                  <option value="Chocolate Specials" />
                </datalist>
              </div>

              <Input
                type="number"
                label="Sell Price"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({ ...form, sellPrice: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                label="Cost Price"
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
              <Button fullWidth color="green" onClick={addItem}>
                Add Item
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Revenue */}
        {activeMenu === "revenue" && (
          <Card>
            <CardHeader color="blue" className="pb-0">
              <Typography variant="h5">Revenue Chart</Typography>
            </CardHeader>
            <CardBody>
              {ordersData.orders.length ? (
                <Line data={chartData} />
              ) : (
                <Typography>No data available</Typography>
              )}
            </CardBody>
          </Card>
        )}

        {/* Recent Sales */}
        {activeMenu === "recent-sales" && (
          <Card>
            <CardHeader color="amber" className="pb-0">
              <Typography variant="h5">Recent Sales</Typography>
            </CardHeader>
            <CardBody className="space-y-2 max-h-96 overflow-y-auto">
              {ordersData.orders.map((o) => (
                <div key={o._id} className="border-b border-gray-200 pb-2">
                  <Typography variant="small">
                    {new Date(o.createdAt).toLocaleString()}
                  </Typography>
                  <Typography>Total: ₹{o.total}</Typography>
                  {o.items.map((it, idx) => (
                    <Typography key={it._id || idx} className="ml-2">
                      {it.name} x {it.qty}
                    </Typography>
                  ))}
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Product List (Grouped by Category) */}
        {activeMenu === "product-list" && (
          <Card>
            <CardHeader color="purple" className="pb-0">
              <Typography variant="h5">Product List</Typography>
            </CardHeader>
            <CardBody className="max-h-96 overflow-y-auto space-y-4">
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
                    className="font-bold mb-2 text-blue-600"
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
