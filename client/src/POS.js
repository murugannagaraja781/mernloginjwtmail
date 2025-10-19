import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function POS() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/items");
      if (Array.isArray(res)) setItems(res);
    })();
  }, []);

  const add = (item) => {
    const found = cart.find((c) => c.itemId === item._id);
    if (found)
      setCart(
        cart.map((c) => (c.itemId === item._id ? { ...c, qty: c.qty + 1 } : c))
      );
    else
      setCart([
        ...cart,
        {
          itemId: item._id,
          name: item.name,
          qty: 1,
          sellPrice: item.sellPrice,
        },
      ]);
  };

  const changeQty = (id, qty) =>
    setCart(
      cart
        .map((c) => (c.itemId === id ? { ...c, qty: Math.max(0, qty) } : c))
        .filter((c) => c.qty > 0)
    );

  const subtotal = cart.reduce((s, c) => s + c.sellPrice * c.qty, 0);
  const total = subtotal + Number(tax);

  const createOrder = async () => {
    const subtotal = cart.reduce((s, c) => s + c.sellPrice * c.qty, 0);
    const total = subtotal + Number(tax);

    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({ items: cart, total }), // ✅ send total
    });

    if (res.order?._id) {
      // Print receipt (your existing code)
      const receiptHtml = `
      <div>
        <h3>Receipt</h3>
        <div>${new Date().toLocaleString()}</div>
        ${cart
          .map(
            (c) => `<div>${c.name} x ${c.qty} — ₹${c.sellPrice * c.qty}</div>`
          )
          .join("")}
        <div>Subtotal: ₹${subtotal}</div>
        <div>Tax: ₹${tax}</div>
        <div><b>Total: ₹${total}</b></div>
      </div>
    `;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      setCart([]);
      setTax(0);
      alert("Order created");
    } else alert(res.msg || "Error creating order");
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <h3>Items</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {items.map((i) => (
            <div
              key={i._id}
              style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
            >
              <div>{i.name}</div>
              <div>₹ {i.sellPrice}</div>
              <button onClick={() => add(i)}>Add</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 360, border: "1px solid #eee", padding: 12 }}>
        <h3>Cart</h3>
        {cart.map((c) => (
          <div
            key={c.itemId}
            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
          >
            <div>
              {c.name} x{" "}
              <input
                style={{ width: 48 }}
                type="number"
                value={c.qty}
                onChange={(e) => changeQty(c.itemId, Number(e.target.value))}
              />
            </div>
            <div>₹{c.sellPrice * c.qty}</div>
          </div>
        ))}
        <hr />
        <div>Subtotal: ₹{subtotal}</div>
        <div>
          Tax:{" "}
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
          />
        </div>
        <div>
          <b>Total: ₹{total}</b>
        </div>
        <button onClick={createOrder} disabled={!cart.length}>
          Create Order & Print
        </button>
      </div>
    </div>
  );
}
