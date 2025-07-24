/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
// import { dummyBookingData } from "../assets/assets.js";
import LoadingComponent from "../components/LoadingComponent.jsx";
import BlurCircle from "../components/BlurCircle.jsx";
import timeFormat from "../lib/timeFormat.js";
import dateFormat from "../lib/dateFormat.js";
import { useAppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, tmdb_image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setBookings(data.bookings);
      else toast.error("Something went wrong");
    } catch (error) {
      console.log("Error in getting all bookings:", error);
      toast.error("Error in getting bookings");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
        >
          <div className="flex flex-col md:flex-row">
            {/* Movie Poster */}
            <img
              src={tmdb_image_base_url + item.show.movie.poster_path}
              alt="poster"
              className="md:max-w-45 aspect-video h-auto rounded object-cover object-bottom"
            />
            {/* Show Date, Time & Duration */}
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">
                {timeFormat(item.show.movie.runtime)}
              </p>
              <p className="text-gray-400 text-sm mt-auto">
                {dateFormat(item.show.showDateTime)}
              </p>
            </div>
          </div>

          {/* Prices & Seats */}
          <div className="flex flex-col md:items-end md:text-right justify-between p-4">
            {/* Currency & Pay Btn */}
            <div className="flex items-center gap-4">
              <p className="text-2xl font-semibold mb-3">
                {currency}
                {item.amount}
              </p>
              {!item.isPaid && (
                <Link
                  to={item.paymentLink}
                  className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                >
                  Pay Now
                </Link>
              )}
            </div>
            {/* Seat Infos */}
            <div className="text-sm">
              <p className="text-gray-400">
                <span>Total Tickets: </span>
                {item.bookedSeats.length}
              </p>
              <p className="text-gray-400">
                <span>Seat Numbers: </span>
                {item.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <LoadingComponent />
  );
};

export default MyBookings;
