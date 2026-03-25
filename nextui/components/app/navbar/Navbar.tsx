import Link from "next/link";
import AppLogo from "../Logos/AppLogo";
import Login from "../auth/Login";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 w-full z-20">
      <div className="max-w-7xl flex items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center">
          <AppLogo />
        </Link>
        <div className="flex gap-4 items-center">
          <NotificationBell />
          <Login />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
