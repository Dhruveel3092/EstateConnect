import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md p-4 px-8 flex justify-between items-center sticky top-0 z-50">
      
      <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
        EstateConnectPro
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          to="/"
          className="text-gray-700 font-medium hover:text-blue-600 transition duration-300"
        >
          Home
        </Link>

        <Link
          to="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition duration-300"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border-2 border-blue-500 text-blue-500 px-4 py-2 rounded-full font-semibold hover:bg-blue-500 hover:text-white transition duration-300"
        >
          Register
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
