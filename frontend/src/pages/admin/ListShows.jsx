import { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import { dummyShowsData } from "../../assets/assets.js";
import LoadingComponent from "../../components/LoadingComponent";
import dateFormat from "../../lib/dateFormat.js";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 590,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in ListShows.jsx: ", error);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

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
