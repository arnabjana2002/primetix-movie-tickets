/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL;
// Base URL for axios requests: http://localhost:5000

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const tmdb_image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.log("Error in fetchIsAdmin:", error.message);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in fetchShows:", error.message);
    }
  };

  const fetchFavouriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favourites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setFavouriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in fetchFavouriteMovies:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavouriteMovies();
    }
  }, [user]);

  useEffect(() => {
    fetchShows();
  }, []);

  const value = {
    axios,
    getToken,
    user,
    favouriteMovies,
    fetchFavouriteMovies,
    shows,
    tmdb_image_base_url,
    fetchIsAdmin,
    isAdmin,
    fetchShows,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
