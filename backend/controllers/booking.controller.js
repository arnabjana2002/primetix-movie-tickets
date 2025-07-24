import { inngest } from "../Inngest/index.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import stripe from "stripe";

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
// path: POST /api/booking/create
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

    //* Done: Stripe Payment Gateway goes here
    //* Initializing Stripe Instance
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    //* Creating line items for Stripe
    const line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: showDetails.movie.title,
          },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];
    //* Creating payment session using line_items
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, //! Expires in 30 minutes
    });
    //* Saving the session link in the database
    booking.paymentLink = session.url;
    await booking.save();

    //* Run inggest scheduler function to check payment status after 10 minutes
    await inngest.send({
      name: "app/checkpayment",
      data: {
        bookingId: booking._id.toString(),
      },
    });

    res.status(201).json({ success: true, url: session.url }); //* sending the session link to the frontend within the response json
  } catch (error) {
    console.log("Error occurred in createBooking controller", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// desc: Controller function to get occupied seats
// path: GET /api/booking/seats/:showId
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
