import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import BlurCircle from "./BlurCircle";
// import { dummyShowsData } from "../assets/assets.js";
import MovieCard from "./MovieCard.jsx";
import { useAppContext } from "../context/AppContext.jsx";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { shows } = useAppContext();

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      {/* Title */}
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />
        <p className="text-gray-300 font-medium text-lg">Now Showing</p>
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          View All{" "}
          <ArrowRight className="group-hover:translate-x-0.5 transition size-4.5" />
        </button>
      </div>

      {/* Movie List */}
      <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
        {/* Showing 4 Movies */}
        {shows.slice(0, 4).map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-20">
        <button
          className="px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
