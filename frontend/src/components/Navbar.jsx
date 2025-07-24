import { Link, useNavigate } from "react-router";
import { assets } from "../assets/assets.js";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useState } from "react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Using Clerk Hooks
  const { user } = useUser();
  const { openSignIn } = useClerk();

  // Using Navigate
  const navigate = useNavigate();

  const { favouriteMovies } = useAppContext();

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
      </Link>

      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${
          isOpen ? "max-md:w-full" : "max-md:w-0"
        }`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 size-6 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />

        <Link
          to="/"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          Home
        </Link>
        <Link
          to="/movies"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          Movies
        </Link>
        <Link
          to="/"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          Theatre
        </Link>
        <Link
          to="/"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          Releases
        </Link>
        {favouriteMovies?.length > 0 && (
          <Link
            to="/favourite"
            onClick={() => {
              scrollTo(0, 0);
              setIsOpen(false);
            }}
          >
            Favourites
          </Link>
        )}
      </div>

      <div className="flex items-center gap-8">
        <SearchIcon className="max-md:hidden size-6 cursor-pointer" />
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus className="size-4" />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>
      <MenuIcon
        className="max-md:ml-4 md:hidden size-8 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

export default Navbar;
