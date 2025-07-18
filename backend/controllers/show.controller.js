import axios from "axios";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";

// desc: Api to get now playing movies from TMDB API
// route: GET /api/show/now-playing
// access: Protected (Admin)
export const getNowPlayingMovies = async (_, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
        },
      }
    );
    res.status(200).json({ success: true, movies: data.results });
  } catch (error) {
    console.log("Error occurred in getNowPlayingMovies controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api to add a new show to the database
// route: POST /api/show/add
// access: Protected (Admin)
export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;

    // First, find the movie in the database
    let movie = await Movie.findById(movieId);

    // If movie is not found in the database, we need to get the data from TMDB
    if (!movie) {
      // We fetch both the Movie data & Cast data
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
          },
        }),
      ]);

      const movieDetailsData = movieDetailsResponse.data;
      const movieCreditssData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieDetailsData.title,
        overview: movieDetailsData.overview || "",
        poster_path: movieDetailsData.poster_path,
        backdrop_path: movieDetailsData.backdrop_path,
        release_date: movieDetailsData.release_date,
        original_language: movieDetailsData.original_language,
        tagline: movieDetailsData.tagline || "",
        genres: movieDetailsData.genres,
        casts: movieCreditssData.cast,
        vote_average: movieDetailsData.vote_average,
        runtime: movieDetailsData.runtime,
      };

      // Add movie details to the database
      movie = await Movie.create(movieDetails);
    }

    // Create & Add Show to the database
    // As we need to create multiple shows, so we create an array of all the shows
    const showsToCreate = [];
    showInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(`${showDate}T${time}`),
          showPrice,
          occupiedSeats: {},
        });
      });
    });
    if (showsToCreate.length > 0) await Show.insertMany(showsToCreate);
    res.status(200).json({ success: true, message: "Show added successfully" });
  } catch (error) {
    console.log("Error occurred in addShow controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api to get all the shows from the database
// route: GET /api/show/all
// access: Public
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie") //* To populate the referred field 'movie'
      .sort({ showDateTime: 1 });

    const uniqueShows = new Set(shows.map((show) => show.movie));

    res.status(200).json({ success: true, message: Array.from(uniqueShows) });
  } catch (error) {
    console.log("Error occurred in getAllShows controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api to get a single show from the database
// route: GET /api/show/:movieId
// access: Public
export const getSingleShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });
    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });
    res.status(200).json({ success: true, movie, dateTime });
  } catch (error) {
    console.log("Error occurred in getSingleShow controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
