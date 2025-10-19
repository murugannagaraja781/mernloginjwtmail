import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function AdminDashboard() {
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
    sellPrice: 0,
    costPrice: 0,
    stock: 0,
  });

  // Load items and orders
  const load = async () => {
    try {
      const it = await apiFetch("/items");
      if (Array.isArray(it)) setItems(it);

      const od = await apiFetch("/orders");
      if (od.orders) setOrdersData(od);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Add item
  const add = async () => {
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res._id) {
        setForm({
          name: "",
          category: "",
          sellPrice: 0,
          costPrice: 0,
          stock: 0,
        });
        load();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  // Delete item
  const del = async (id) => {
    try {
      await apiFetch(`/items/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left: Add & List Items */}
        <div style={{ flex: 1 }}>
          <h3>Add Item</h3>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="Sell Price"
            value={form.sellPrice}
            onChange={(e) =>
              setForm({ ...form, sellPrice: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Cost Price"
            value={form.costPrice}
            onChange={(e) =>
              setForm({ ...form, costPrice: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Sell Price"
            value={form.sellPrice}
            onChange={(e) =>
              setForm({ ...form, sellPrice: Number(e.target.value) })
            }
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
          />
          <button onClick={add}>Add</button>

          <h3>Items</h3>
          <ul>
            {items.map((i) => (
              <li key={i._id}>
                {i.name} — ₹{i.sellPrice} (Stock: {i.stock}){" "}
                <button onClick={() => del(i._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Orders & Profit */}
        <div style={{ width: 360 }}>
          <h3>Orders & Profit</h3>
          <div>Revenue: ₹{ordersData.revenue}</div>
          <div>Cost: ₹{ordersData.cost}</div>
          <div>Profit: ₹{ordersData.profit}</div>
          <h4>Recent Orders</h4>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {ordersData.orders.map((o) => (
              <div
                key={o._id}
                style={{ borderBottom: "1px solid #eee", padding: 8 }}
              >
                <div>{new Date(o.createdAt).toLocaleString()}</div>
                <div>Total: ₹{o.total}</div>
                {o.items.map((it) => (
                  <div key={it._id || it.itemId}>
                    {it.name} x {it.qty}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
