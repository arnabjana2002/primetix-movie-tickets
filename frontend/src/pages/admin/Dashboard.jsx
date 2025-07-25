/* eslint-disable react-hooks/exhaustive-deps */
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
// import { dummyDashboardData } from "../../assets/assets.js";
import LoadingComponent from "../../components/LoadingComponent";
import Title from "../../components/admin/Title.jsx";
import BlurCircle from "../../components/BlurCircle.jsx";
import dateFormat from "../../lib/dateFormat.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, tmdb_image_base_url } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value:
        currency +
        (new Intl.NumberFormat("en-IN").format(dashboardData.totalRevenue) ||
          "0"),
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || "0",
      icon: UserIcon,
    },
  ];

  const fetchDashboardData = async () => {
    // setDashboardData(dummyDashboardData);
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
        setIsLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in fetchDashboardData:", error);
      toast.error("Error in fetching dashboard data");
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return !isLoading ? (
    <>
      {/* Title */}
      <Title text1="Admin" text2="Dashboard" />
      {/* Content */}
      {/* Dashboard Data */}
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card?.value}</p>
              </div>
              <card.icon className="size-6" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />
        {dashboardData.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
          >
            <img
              src={tmdb_image_base_url + show.movie.poster_path}
              className="h-60 w-full object-cover"
              alt=""
            />
            <p className="font-medium p-2 truncate">{show.movie.title}</p>
            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium">
                {currency}{" "}
                {new Intl.NumberFormat("en-IN").format(show.showPrice)}
              </p>
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                <StarIcon className="size-4 text-primary fill-primary" />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>
            <p className="px-2 pt-2 text-sm text-gray-500">
              {dateFormat(show.showDateTime)}
            </p>
          </div>
        ))}
      </div>
    </>
  ) : (
    <LoadingComponent />
  );
};

export default Dashboard;
