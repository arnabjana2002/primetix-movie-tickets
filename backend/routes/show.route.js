import { Router } from "express";
import {
  addShow,
  getAllShows,
  getNowPlayingMovies,
  getSingleShow,
} from "../controllers/show.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const showRouter = Router();

showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", getAllShows);
showRouter.get("/:movieId", getSingleShow);

export default showRouter;
