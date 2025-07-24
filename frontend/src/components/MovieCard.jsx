import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router";
import timeFormat from "../lib/timeFormat.js";
import { useAppContext } from "../context/AppContext.jsx";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { tmdb_image_base_url } = useAppContext();

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-66">
      {/*Here is a nice animation for hover */}
      {/* Movie Image */}
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
        src={tmdb_image_base_url + movie.backdrop_path}
        alt=""
        className="rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer"
      />

      {/* Movie Title */}
      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      {/* Movie Details */}
      <p className="text-sm text-gray-400 mt-2">
        {new Date(movie.release_date).getFullYear()} •{" "}
        {movie.genres
          .slice(0, 2) // Show only 2 genres
          .map((genre) => genre.name)
          .join(" | ")}{" "}
        • {timeFormat(movie.runtime)}
      </p>

      {/* Buy Tickets Button */}
      <div className="flex items-center justify-between mt-4 pb-3">
        <button
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
        >
          Buy Tickets
        </button>
        <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
          <StarIcon className="size-4 text-primary fill-primary" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
