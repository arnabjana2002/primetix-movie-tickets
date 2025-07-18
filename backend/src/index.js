import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "../database/connectDB.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "../Inngest/index.js";
import showRouter from "../routes/show.route.js";

const port = process.env.PORT || 3000;

const app = express();

await connectDB();

// Common Middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173/"],
  })
);

// Additional Middlewares
app.use(clerkMiddleware());

//* Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

// API Routes
app.get("/", (req, res) => res.send("Server is Live!!"));
app.use("/api/show", showRouter);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
