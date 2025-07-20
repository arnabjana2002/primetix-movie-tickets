import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";

// desc: Api to check if the user is admin or not
//* It will be used in the middleware to check the role of the user
export const isAdmin = async (_, res) => {
  res.status(200).json({ success: true, isAdmin: true });
};

// desc: Api to get dashboard data
export const getDashboardData = async (_, res) => {
  try {
    //? In dashboard, we need to show:
    //? Total Bookings
    //? Total Revenue
    //? Active Shows
    //? Total Users

    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");
    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking, 0),
      activeShows,
      totalUser,
    };

    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.log("Error occurred in getDashboardData controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api to get all Shows
export const getAllShows = async (_, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.status(200).json({ success: true, shows });
  } catch (error) {
    console.log("Error in getAllShows controller in admin", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Api to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log("Error in getAllBookings controller in admin", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
