import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import sendEmail from "../nodemailer/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//! Create Inngest functions here
//* Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    // Creating object in mongoDB
    await User.create({
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: image_url,
    });
  }
);

//* Inngest function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

//* Inngest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    await User.findByIdAndUpdate(id, {
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: image_url,
    });
  }
);

//* Inngest function to cancel booking & release seats of show after 10 minutes of booking created if payment is not done
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If the payment is not done, release seats & delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

//* Inngest function to send an email when user books a show
const sendBookingConfirmationMail = inngest.createFunction(
  { id: "send-booking-confirmation-mail" },
  { event: "app/show.booked" },
  async ({ event }) => {
    const { bookingId } = event.data;

    // get the booking object
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.05);">
      
      <h2 style="text-align: center; color: #0a66c2;">Booking Confirmed</h2>
      <p style="text-align: center; margin-top: -10px;">Your payment was successful</p>
      
      <hr style="border: none; border-top: 1px solid #ddd;" />
      
      <p style="font-size: 16px;"><strong>Hi ${booking.user.name},</strong></p>
      <p style="margin-top: -10px;">Thank you for your booking. Here are your ticket details:</p>

      <h3 style="color: #0a66c2;">Movie Details</h3>
      <p><strong>Movie:</strong> ${booking.show.movie.title}</p>
      <p><strong>Date:</strong> ${new Date(
        booking.show.showDateTime
      ).toLocalDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      <p><strong>Showtime:</strong> ${new Date(
        booking.show.showDateTime
      ).toLocalTimeString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      
      <h3 style="color: #0a66c2;">Seats</h3>
      <p>${booking.bookedSeats.join(", ")}</p>
      
      <h3 style="color: #0a66c2;">Payment Summary</h3>
      <p><strong>Tickets (${booking.bookedSeats.length} x ${
        process.env.CURRENCY
      }${booking.show.showPrice}):</strong> ${process.env.CURRENCY}${
        booking.amount
      }</p>
      <p><strong>Total Paid:</strong> <span style="font-weight: bold;">${
        process.env.CURRENCY
      }${booking.amount}</span></p>
      
      <h3 style="color: #0a66c2;">Booking ID:</h3>
      <p>${booking._id}</p>
      
      <hr style="border: none; border-top: 1px solid #ddd;" />
      
      <p>🎬 Please arrive 15 minutes before the showtime. Show this email or your booking ID at the entry.</p>
      
      <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
        You received this email because you made a booking on PrimeTix.com<br />
        Need help? <span style="color: #0a66c2; text-decoration: none;">Contact Support</span>
      </p>
    </div>
  </div>`,
    });
  }
);

//* An array where to export Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationMail,
];
