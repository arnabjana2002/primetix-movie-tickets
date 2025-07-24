import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
// import { dummyDateTimeData, dummyShowsData } from "../assets/assets.js";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat.js";
import DateSelect from "../components/DateSelect.jsx";
import MovieCard from "../components/MovieCard.jsx";
import LoadingComponent from "../components/LoadingComponent.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const { id: movieId } = useParams();
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const {
    axios,
    getToken,
    user,
    favouriteMovies,
    fetchFavouriteMovies,
    shows,
    tmdb_image_base_url,
  } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${movieId}`);

      if (data.success) setShow(data);
    } catch (error) {
      console.log("Error in getting the show:", error);
    }
  };

  const handleFavourite = async () => {
    try {
      if (!user) toast.error("Please login to proceed");
      const { data } = await axios.post(
        "/api/user/update-favourite",
        { movieId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      if (data.success) {
        await fetchFavouriteMovies();
        toast.success(data.message);
      } else toast.error("Something went wrong!");
    } catch (error) {
      console.log("Error while updating favourites", error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    getShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      {/* Movie Info Section */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Movie Poster */}
        <img
          src={tmdb_image_base_url + show.movie.poster_path}
          alt=""
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        {/* Movie Infos & Action Buttons */}
        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          {/* Language */}
          <p className="text-primary">ENGLISH</p>
          {/* Title */}
          <h1 className="text-balance text-4xl font-semibold max-w-96">
            {show.movie.title}
          </h1>
          {/* Rating */}
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="size-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)}/10 User Rating
          </div>
          {/* Movie Overview */}
          <p className="text-gray-400 mt2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>
          {/* Runtime, Genres & Releasing Year */}
          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((genre) => genre.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="size-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
              onClick={handleFavourite}
            >
              <Heart
                className={`size-5 ${
                  favouriteMovies?.length > 0 &&
                  favouriteMovies.find((movie) => movie._id === movieId)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Movie Cast Section */}
      <p className="text-lg font-medium mt-20">Your Favourite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={tmdb_image_base_url + cast.profile_path}
                alt="Cast"
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date Select Section */}
      <DateSelect dateTime={show.dateTime} id={movieId} />

      {/* Recommendation Section */}
      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  ) : (
    <LoadingComponent />
  );
};

export default MovieDetails;
