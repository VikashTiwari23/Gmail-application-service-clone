import {
  IconBrandGmail,
  IconFileText,
  IconInbox,
  IconMenu2,
  IconPencil,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navLinks = [
    { name: "Inbox", id: 0, link: "/inbox", icon: IconInbox },
    { name: "Sent", id: 1, link: "/sent", icon: IconSend },
    { name: "Draft", id: 2, link: "/draft", icon: IconFileText },
    { name: "Trash", id: 3, link: "/trash", icon: IconTrash },
  ];

  return (
    <aside className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-800/80 min-h-screen self-stretch flex flex-col px-4 py-6 select-none">
      {/* Sticky inner wrapper keeps links visible while scrolling long inboxes */}
      <div className="sticky top-6 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <button
            type="button"
            className="rounded-full p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <IconMenu2 size={22} />
          </button>

          <div className="flex items-center gap-2.5">
            <IconBrandGmail size={28} className="text-red-500" />
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Gmail
            </span>
          </div>
        </div>

        {/* Compose Button */}
        <NavLink
          to="/compose"
          className="flex items-center justify-center gap-2.5 px-5 py-3.5 mb-6 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-2xl shadow-md shadow-yellow-500/10 transition-all"
        >
          <IconPencil size={20} />
          <span>Compose</span>
        </NavLink>

        {/* Folder Links */}
        <nav className="flex flex-col gap-1.5 font-medium">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                to={item.link}
                key={item.id}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-yellow-400/15 text-yellow-400 font-semibold"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;