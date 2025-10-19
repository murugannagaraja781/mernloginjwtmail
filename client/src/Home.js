import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";
import {
  Navbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Card,
  CardBody,
} from "@material-tailwind/react";

export default function Home({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/items");
      if (Array.isArray(res)) setItems(res);
    })();
  }, []);

  return (
    <div>
      {/* Top Navbar */}
      <Navbar className="sticky top-0 z-50 px-4 py-2 shadow-md bg-white">
        <Typography variant="h5" className="text-blue-gray-900">
          My POS App
        </Typography>

        <div className="ml-auto flex items-center gap-4">
          {/* Profile Dropdown */}
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

      {/* Product Grid */}
      <div className="p-4 md:p-6 lg:p-8">
        <Typography variant="h4" className="mb-6">
          Menu
        </Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((i) => (
            <Card key={i._id} className="hover:shadow-lg transition-shadow">
              <CardBody className="space-y-2">
                <Typography variant="h6">{i.name}</Typography>
                <Typography color="blue-gray">₹ {i.sellPrice}</Typography>
                <Typography color="gray">Stock: {i.stock}</Typography>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
