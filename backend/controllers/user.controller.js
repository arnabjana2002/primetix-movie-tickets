import Booking from "../models/booking.model.js";
import { clerkClient } from "@clerk/express";
import Movie from "../models/movie.model.js";

// desc: Api controller function to get user bookings
// path: GET /api/user/bookings
// access: Protected (User)
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId;

    const bookings = await Booking.find({ userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log("Error occurred in getUserBookings controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api controller function to update favourite movie in Clerk User Metadata
// path: POST /api/user/update-favourite
// access: Protected (User)
export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // If there is no favourites array in privateMetadata, initialize it
    if (!user.privateMetadata.favourites) {
      user.privateMetadata.favourites = [];
    }

    // Check if the movieId is already in favourites
    //  If not, add it
    if (!user.privateMetadata.favourites.includes(movieId)) {
      user.privateMetadata.favourites.push(movieId);
    } else {
      // If it is already in favourites, remove it
      user.privateMetadata.favourites = user.privateMetadata.favourites.filter(
        (item) => item !== movieId
      );
    }

    // Update the user's private metadata with the new favourites array
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res
      .status(201)
      .json({ success: true, message: "Favourite added successfully" });
  } catch (error) {
    console.log("Error occurred in updateFavourite controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api controller function to get favourite movies from Clerk User Metadata
// path: GET /api/user/favourites
// access: Protected (User)
export const getFavourites = async (req, res) => {
  try {
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // If there are no favourites, return an empty array
    if (!user.privateMetadata.favourites) {
      return res.status(200).json({ success: true, favourites: [] });
    }

    // Fetch the favourite movies from Clerk User Metadata
    const favourites = user.privateMetadata.favourites;

    // Getting movies from the database
    const movies = await Movie.find({ _id: { $in: favourites } });

    res.status(200).json({ success: true, movies });
  } catch (error) {
    console.log("Error occurred in getFavourites controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
