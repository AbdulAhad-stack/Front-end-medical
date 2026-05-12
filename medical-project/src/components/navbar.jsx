import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import medicalLogo from "../assets/medical logo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // ✅ CLEAN ROUTES (MATCH APP.JSX)
  const links = [
    { name: "Sign Up", path: "/" },
    { name: "Login", path: "/loginmodal" },
    { name: "Chat", path: "/chat" },
    { name: "Analyzer", path: "/analyzer" },
    
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-[9999] h-[72px] flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={medicalLogo}
            alt="Logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold text-gray-800">
            Medical Portal
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          {links.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative transition ${
                  active ? "text-teal-600" : "hover:text-black"
                }`}
              >
                {item.name}

                {active && (
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-teal-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* MOBILE TOGGLE */}
       <button
  className="md:hidden text-black z-[10000]"
  onClick={() => setOpen(!open)}
>
  {open ? <X size={28} /> : <Menu size={28} />}
</button>
      </nav>

      {/* SPACER */}
      <div className="h-[72px]" />

      {/* MOBILE MENU */}
     {/* MOBILE MENU */}
<div
  className={`fixed top-[72px] left-0 w-full z-[9998] bg-white border-b border-gray-200 shadow-lg flex flex-col items-center gap-5 py-6 md:hidden transition-all duration-300 ${
    open
      ? "opacity-100 visible translate-y-0"
      : "opacity-0 invisible -translate-y-2"
  }`}
>
  {links.map((item) => (
    <Link
      key={item.name}
      to={item.path}
      onClick={() => setOpen(false)}
      className="text-gray-700 hover:text-black"
    >
      {item.name}
    </Link>
  ))}
</div>
    </>
  );
};

export default Navbar;