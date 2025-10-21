import React, { useEffect, useState, useCallback } from "react";
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
  IconButton,
  Badge,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for cart management
const useCart = () => {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.itemId === item._id);
      if (existing) {
        return prevCart.map((c) =>
          c.itemId === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [
        ...prevCart,
        {
          itemId: item._id,
          name: item.name,
          qty: 1,
          sellPrice: item.sellPrice,
          category: item.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, newQty) => {
    setCart((prevCart) =>
      prevCart
        .map((c) => (c.itemId === id ? { ...c, qty: Math.max(0, newQty) } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((c) => c.itemId !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.sellPrice * item.qty, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.qty, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };
};

// Icon components to replace Heroicons
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 12H4"
    />
  </svg>
);

const PrintIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export default function POS({ user, onLogout }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tax, setTax] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/items");
        if (Array.isArray(res)) setItems(res);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Get unique categories
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category for display
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const subtotal = getCartTotal();
  const total = subtotal + Number(tax);

  const createOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart,
          total,
          tax: Number(tax),
        }),
      });

      if (res.order?._id) {
        // Store cart data for receipt before clearing
        const receiptData = {
          cart: [...cart], // Create a copy of the cart
          subtotal,
          tax: Number(tax),
          total,
          orderId:
            res.order._id ||
            Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: new Date().toLocaleString(),
        };

        setPrintDialogOpen(true);
        // Store receipt data in state or ref for printing
        setReceiptData(receiptData);
        clearCart();
        setTax(0);
      } else {
        alert(res.msg || "Error creating order");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    if (!receiptData) {
      alert("No receipt data available");
      return;
    }

    const {
      cart: receiptCart,
      subtotal: receiptSubtotal,
      tax: receiptTax,
      total: receiptTotal,
      orderId,
      timestamp,
    } = receiptData;

    const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - Pluto Café</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 300px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 14px;
        }
        .total {
          border-top: 2px dashed #000;
          padding-top: 10px;
          font-weight: bold;
          margin-top: 15px;
        }
        .thank-you {
          text-align: center;
          margin-top: 20px;
          font-style: italic;
        }
        .divider {
          border-top: 1px dashed #ccc;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2 style="margin: 0; font-size: 24px;">Pluto Café</h2>
        <p style="margin: 5px 0; font-size: 12px;">${timestamp}</p>
        <p style="margin: 5px 0; font-size: 12px;">Order: ${orderId}</p>
      </div>

      <div class="divider"></div>

      ${receiptCart
        .map(
          (item) => `
        <div class="item">
          <span>${item.name} x${item.qty}</span>
          <span>₹${(item.sellPrice * item.qty).toFixed(2)}</span>
        </div>
      `
        )
        .join("")}

      <div class="divider"></div>

      <div class="item">
        <span>Subtotal:</span>
        <span>₹${receiptSubtotal.toFixed(2)}</span>
      </div>
      <div class="item">
        <span>Tax:</span>
        <span>₹${receiptTax.toFixed(2)}</span>
      </div>
      <div class="item total">
        <span>TOTAL:</span>
        <span>₹${receiptTotal.toFixed(2)}</span>
      </div>

      <div class="thank-you">
        <p style="margin: 0; font-size: 12px;">Thank you for your visit!</p>
        <p style="margin: 5px 0; font-size: 10px;">Visit us again!</p>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups for printing receipts");
      return;
    }

    printWindow.document.write(receiptHtml);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();

      // Close window after printing
      setTimeout(() => {
        printWindow.close();
        setPrintDialogOpen(false);
        // Clear receipt data after printing
        setReceiptData(null);
      }, 500);
    };
  };

  const goToDashboard = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <Navbar className="sticky top-0 z-50 px-6 py-3 shadow-lg bg-gradient-to-r from-blue-900 to-indigo-900 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <Typography variant="h4" className="font-bold text-blue-900">
                PLUTO
              </Typography>
            </div>
            <Typography variant="h6" className="text-white hidden md:block">
              Point of Sale
            </Typography>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart Badge */}
            <Badge content={getCartItemCount()} className="bg-red-500">
              <CartIcon />
            </Badge>

            {/* User Menu */}
            <Menu open={menuOpen} handler={setMenuOpen}>
              <MenuHandler>
                <Button
                  variant="text"
                  className="flex items-center gap-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <Avatar
                    size="sm"
                    variant="circular"
                    alt="User"
                    className="border-2 border-white"
                    src={`https://ui-avatars.com/api/?name=${
                      user?.name || "U"
                    }&background=4f46e5&color=fff`}
                  />
                  <span className="text-white font-medium hidden sm:inline">
                    {user?.name}
                  </span>
                </Button>
              </MenuHandler>
              <MenuList className="shadow-xl">
                <MenuItem className="flex items-center gap-2">
                  <Avatar
                    size="sm"
                    alt="User"
                    src={`https://ui-avatars.com/api/?name=${
                      user?.name || "U"
                    }&background=4f46e5&color=fff`}
                  />
                  <div>
                    <Typography variant="small" className="font-bold">
                      {user?.name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      {user?.email}
                    </Typography>
                  </div>
                </MenuItem>
                <hr className="my-2" />
                <MenuItem
                  onClick={goToDashboard}
                  className="flex items-center gap-2"
                >
                  📊 Dashboard
                </MenuItem>
                <MenuItem
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-500"
                >
                  🚪 Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </Navbar>

      {/* Main Content */}
      <div className="p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Items */}
        <div className="flex-1">
          {/* Search and Filter Section */}
          <Card className="shadow-lg mb-6">
            <CardBody className="p-4 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <SearchIcon />
                </div>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                  icon={
                    searchTerm && (
                      <div
                        className="cursor-pointer"
                        onClick={() => setSearchTerm("")}
                      >
                        <CloseIcon />
                      </div>
                    )
                  }
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category}
                    value={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Typography variant="h6" className="text-gray-500">
                Loading products...
              </Typography>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <Typography
                    variant="h4"
                    className="text-gray-800 mb-4 font-bold border-b-2 border-blue-500 pb-2"
                  >
                    {category}
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryItems.map((item) => (
                      <Card
                        key={item._id}
                        className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-700 hover:-translate-y-1"
                      >
                        <CardBody className="p-4 space-y-3">
                          <div>
                            <Typography
                              variant="h6"
                              className="font-bold text-gray-800 line-clamp-2"
                            >
                              {item.name}
                            </Typography>
                            <Typography
                              variant="small"
                              className="text-gray-500"
                            >
                              {item.category}
                            </Typography>
                          </div>

                          <div className="flex justify-between items-center">
                            <Typography
                              variant="h6"
                              className="text-green-600 font-bold"
                            >
                              ₹{item.sellPrice}
                            </Typography>
                            <Chip
                              value={`Stock: ${item.stock}`}
                              size="sm"
                              className={`${
                                item.stock > 10
                                  ? "bg-green-100 text-green-800"
                                  : item.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            />
                          </div>

                          <Button
                            size="sm"
                            fullWidth
                            onClick={() => addToCart(item)}
                            disabled={item.stock === 0}
                            className={`flex items-center justify-center gap-2 ${
                              item.stock === 0
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            <PlusIcon />
                            {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full lg:w-96">
          <Card className="shadow-xl border-0 sticky top-24">
            <CardBody className="p-0">
              {/* Cart Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <Typography variant="h5" className="font-bold">
                    Order Summary
                  </Typography>
                  <Badge content={getCartItemCount()} className="bg-red-500">
                    <CartIcon />
                  </Badge>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <CartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <Typography variant="small" className="text-gray-500">
                      Your cart is empty
                    </Typography>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <Typography
                          variant="small"
                          className="font-semibold text-gray-800"
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                          ₹{item.sellPrice} × {item.qty} = ₹
                          {(item.sellPrice * item.qty).toFixed(2)}
                        </Typography>
                      </div>

                      <div className="flex items-center gap-2">
                        <IconButton
                          size="sm"
                          variant="text"
                          onClick={() =>
                            updateQuantity(item.itemId, item.qty - 1)
                          }
                        >
                          <MinusIcon />
                        </IconButton>

                        <Typography
                          variant="small"
                          className="font-bold min-w-8 text-center"
                        >
                          {item.qty}
                        </Typography>

                        <IconButton
                          size="sm"
                          variant="text"
                          onClick={() =>
                            updateQuantity(item.itemId, item.qty + 1)
                          }
                        >
                          <PlusIcon />
                        </IconButton>

                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          onClick={() => removeFromCart(item.itemId)}
                        >
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-4 border-t space-y-3">
                  <div className="flex justify-between">
                    <Typography>Subtotal:</Typography>
                    <Typography className="font-semibold">
                      ₹{subtotal.toFixed(2)}
                    </Typography>
                  </div>

                  <div className="flex justify-between items-center">
                    <Typography>Tax:</Typography>
                    <Input
                      type="number"
                      value={tax}
                      size="sm"
                      className="w-24"
                      onChange={(e) => setTax(Number(e.target.value))}
                      label="Tax Amount"
                    />
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <Typography variant="h6" className="font-bold">
                      Total:
                    </Typography>
                    <Typography
                      variant="h6"
                      className="font-bold text-green-600"
                    >
                      ₹{total.toFixed(2)}
                    </Typography>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outlined"
                      color="red"
                      fullWidth
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Clear Cart
                    </Button>
                    <Button
                      fullWidth
                      onClick={createOrder}
                      disabled={cart.length === 0 || loading}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <PrintIcon />
                          Create Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Print Success Dialog */}
      <Dialog open={printDialogOpen} handler={setPrintDialogOpen}>
        <DialogHeader>Order Created Successfully!</DialogHeader>
        <DialogBody>
          <Typography>
            Your order has been created successfully. Would you like to print
            the receipt now?
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setPrintDialogOpen(false)}
            className="mr-2"
          >
            Skip
          </Button>
          <Button
            className="flex items-center gap-2 bg-blue-600"
            onClick={printReceipt}
          >
            <PrintIcon />
            Print Receipt
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
