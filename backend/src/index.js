import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "../database/connectDB.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "../Inngest/index.js";
import showRouter from "../routes/show.route.js";
import bookingRouter from "../routes/booking.route.js";
import adminRouter from "../routes/admin.route.js";
import userRouter from "../routes/user.route.js";
import { stripeWebhooks } from "../controllers/stripeWebhooks.js";

const port = process.env.PORT || 3000;

const app = express();

await connectDB();

//* Stripe Webhooks Route
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Common Middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
    credentials: true
  })
);

// Also allow preflight for all routes
app.options("*", cors());

// Additional Middlewares
app.use(clerkMiddleware());

//* Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

// API Routes
app.get("/", (req, res) => res.send("Server is Live!!"));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
