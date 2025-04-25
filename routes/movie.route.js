import { Router } from "express";
import { MovieController } from "../controllers/movie.controller.js";

export const createMovieRouter = ({ movieModel }) => {
  const movieRouter = Router();

  const movieController = new MovieController({ movieModel });

  movieRouter.post("/create", movieController.create);
  movieRouter.get("/get-all", movieController.getAll);

  return movieRouter;
};
