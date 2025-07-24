/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
// import { dummyShowsData } from "../../assets/assets.js";
import LoadingComponent from "../../components/LoadingComponent";
import dateFormat from "../../lib/dateFormat.js";
import { useAppContext } from "../../context/AppContext.jsx";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user } = useAppContext();

  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setShows(data.shows);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in ListShows.jsx: ", error);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !isLoading ? (
    <>
      {/* Title */}
      <Title text1="List" text2="Shows" />
      {/* Table */}
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.map((show, index) => (
              <tr
                key={index}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="p-2">
                  {currency}{" "}
                  {new Intl.NumberFormat("en-IN").format(
                    Object.keys(show.occupiedSeats).length * show.showPrice
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <LoadingComponent />
  );
};

export default ListShows;
