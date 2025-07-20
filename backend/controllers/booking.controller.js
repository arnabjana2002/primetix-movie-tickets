import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";

// desc: helper function to check availability of the selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);

    // If show doesn't exist, you cannot book seats
    if (!showData) return false;

    // If the show exist get the occupied seats from that show
    const occupiedSeats = showData.occupiedSeats;

    // If any of the selected seats are occupied
    const isSeatsOccupied = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isSeatsOccupied;
  } catch (error) {
    console.log(
      "Error occurred in checkSeatsAvailability function",
      error.message
    );
    return false;
  }
};

// desc: Controller function to create a new booking
// path: POST /api/bookings/create
// access: Protected (User)
export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check if selected seats are available for the show or not
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Selected seats are no longer available",
      });
    }

    // If the seats are available, get the show details
    const showDetails = await Show.findById(showId).populate("movie");

    // Create a new Booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showDetails.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // Reserve the seats in the Show model
    selectedSeats.map((seat) => (showDetails.occupiedSeats[seat] = userId));
    showDetails.markModified("occupiedSeats");
    await showDetails.save();

    // Todo: Stripe Payment Gateway goes here

    res.status(201).json({ success: true, message: "Booking Succssful" });
  } catch (error) {
    console.log("Error occurred in createBooking controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Controller function to get occupied seats
// path: GET /api/bookings/seats/:showId
// access: Protected (User)
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showDetails = await Show.findById(showId);

    const occupiedSeats = Object.keys(showDetails.occupiedSeats);
    res.status(200).json({ success: true, occupiedSeats });
  } catch (error) {
    console.log("Error occurred in getOccupiedSeats controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
