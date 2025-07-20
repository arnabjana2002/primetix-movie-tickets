import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: String, required: true },
    bookedSeats: { type: Schema.Types.Array, required: true },
    isPaid: { type: Schema.Types.Boolean, default: false },
    paymentLink: { type: String },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
