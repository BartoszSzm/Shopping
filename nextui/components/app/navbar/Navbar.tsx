import Link from "next/link";
import AppLogo from "../Logos/AppLogo";
import Login from "../auth/Login";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 w-full z-20">
      <div className="max-w-7xl flex items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center">
          <AppLogo />
        </Link>
        <Login />
      </div>
    </nav>
  );
};

export default Navbar;
