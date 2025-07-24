/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
// import { dummyShowsData } from "../../assets/assets.js";
import LoadingComponent from "../../components/LoadingComponent";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import kConverter from "../../lib/kConverter.js";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext.jsx";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, tmdb_image_base_url } = useAppContext();

  // State Variables
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    // setNowPlayingMovies(dummyShowsData);
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.log("Error in Fetching Now Playing Movies", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  const handleMovieClick = (movieId) => {
    if (selectedMovie !== movieId) setSelectedMovie(movieId);
    else setSelectedMovie(null);
  };

  //* Date Time Add Function
  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return toast("Please Enter Date & Time");
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) return { ...prev, [date]: [...times, time] };
      return prev;
    });
  };

  //* Date Time Remove Function
  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredItems = prev[date].filter((t) => t !== time);
      if (filteredItems.length === 0) {
        const { [date]: _, ...rest } = prev; // if the date doesn't have any show time then deleting the given date key
        return rest;
      }
      return { ...prev, [date]: filteredItems };
    });
  };

  //* Handler for adding shows
  const handleAddShow = async () => {
    try {
      setAddingShow(true);

      if (
        !selectedMovie ||
        !showPrice ||
        Object.keys(dateTimeSelection).length === 0
      ) {
        toast.error(
          "Please select a movie, enter a price, and add show times."
        );
        setAddingShow(false);
        return;
      }

      const showInput = Object.entries(dateTimeSelection).map(
        ([date, time]) => ({ date, time })
      );

      const payload = {
        movieId: selectedMovie,
        showPrice: Number(showPrice),
        showInput,
      };

      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if(data.success){
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setDateTimeInput("")
      } else{
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in Adding Show:", error.message);
      toast.error("Failed to add show. Please try again.");
    }
    setAddingShow(false);
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      {/* Title */}
      <Title text1="Add" text2="Shows" />
      {/* Now Playing Movies */}
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`}
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={tmdb_image_base_url + movie.poster_path}
                  alt="poster"
                  className="w-full object-cover brightness-90"
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="size-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>
              </div>
              {/* Check Mark */}
              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary size-6 rounded">
                  <CheckIcon strokeWidth={2.5} className="size-4 text-white" />
                </div>
              )}
              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show Input Price */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-sm text-gray-400">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            className="outline-none"
            placeholder="Enter Show Price"
            onChange={(e) => setShowPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Date & Time Input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Select Date & Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            className="outline-none rounded-md"
            onChange={(e) => setDateTimeInput(e.target.value)}
          />
          <button
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
            onClick={handleDateTimeAdd}
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display Selected Time */}
      {Object.entries(dateTimeSelection).map(([date, times]) => (
        <li key={date}>
          <div className="font-medium">{date}</div>
          <div className="flex flex-wrap gap-2 mt-1 text-sm">
            {times.map((time) => (
              <div
                key={time}
                className="border border-primary px-2 py-1 flex items-center rounded"
              >
                <span>{time}</span>
                <DeleteIcon
                  className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() => handleRemoveTime(date, time)}
                />
              </div>
            ))}
          </div>
        </li>
      ))}

      {/* Add Show Button */}
      <button
        onClick={handleAddShow}
        disabled={addingShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
      >
        Add Show
      </button>
    </>
  ) : (
    <LoadingComponent />
  );
};

export default AddShows;
