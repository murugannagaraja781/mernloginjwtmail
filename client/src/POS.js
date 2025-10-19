import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Navbar,
  Avatar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";

export default function POS({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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
    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({ items: cart, total }),
    });

    if (res.order?._id) {
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
    <div>
      {/* Navbar */}
      <Navbar className="sticky top-0 z-50 px-4 py-2 shadow-md bg-white">
        <Typography variant="h5" className="text-blue-gray-900">
          POS System
        </Typography>
        <div className="ml-auto flex items-center gap-4">
          <Menu open={menuOpen} handler={setMenuOpen}>
            <MenuHandler>
              <Button
                variant="text"
                className="flex items-center gap-2 p-1 rounded-full"
              >
                <Avatar
                  size="sm"
                  variant="circular"
                  alt="User"
                  src={`https://ui-avatars.com/api/?name=${user?.name || "U"}`}
                />
                <span className="hidden sm:inline">{user?.name}</span>
              </Button>
            </MenuHandler>
            <MenuList>
              <MenuItem>{user?.email}</MenuItem>
              <MenuItem onClick={onLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Navbar>

      {/* Main Content */}
      <div className="p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Items Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((i) => (
            <Card key={i._id} className="hover:shadow-lg transition-shadow">
              <CardBody className="space-y-2">
                <Typography variant="h6">{i.name}</Typography>
                <Typography color="blue-gray">₹ {i.sellPrice}</Typography>
                <Button size="sm" onClick={() => add(i)}>
                  Add
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Cart Panel */}
        <div className="w-full lg:w-96 border border-gray-200 rounded p-4 flex flex-col gap-3">
          <Typography variant="h6">Cart</Typography>
          {cart.map((c) => (
            <div
              key={c.itemId}
              className="flex justify-between items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <Typography>{c.name} x</Typography>
                <Input
                  type="number"
                  value={c.qty}
                  size="sm"
                  className="w-16"
                  onChange={(e) => changeQty(c.itemId, Number(e.target.value))}
                />
              </div>
              <Typography>₹{c.sellPrice * c.qty}</Typography>
            </div>
          ))}
          <hr />
          <div className="flex justify-between">
            <Typography>Subtotal:</Typography>
            <Typography>₹{subtotal}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography>Tax:</Typography>
            <Input
              type="number"
              value={tax}
              size="sm"
              className="w-20"
              onChange={(e) => setTax(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between">
            <Typography variant="small" className="font-bold">
              Total:
            </Typography>
            <Typography variant="small" className="font-bold">
              ₹{total}
            </Typography>
          </div>
          <Button
            onClick={createOrder}
            disabled={!cart.length}
            className="mt-2"
          >
            Create Order & Print
          </Button>
        </div>
      </div>
    </div>
  );
}
