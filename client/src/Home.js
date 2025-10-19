import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function Home() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await apiFetch("/items");
      if (Array.isArray(res)) setItems(res);
    })();
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>Menu</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
        }}
      >
        {items.map((i) => (
          <div
            key={i._id}
            style={{ border: "1px solid #ddd", padding: 10, borderRadius: 8 }}
          >
            <div>
              <b>{i.name}</b>
            </div>
            <div>₹ {i.sellPrice}</div>
            <div>Stock: {i.stock}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
