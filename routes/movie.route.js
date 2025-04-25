import { Router } from "express";
import { MovieController } from "../controllers/movie.controller.js";

export const createMovieRouter = ({ movieModel }) => {
  const movieRouter = Router();

  const movieController = new MovieController({ movieModel });

  movieRouter.post("/create", movieController.create);
  movieRouter.patch("/update/:id", movieController.update);
  movieRouter.get("/delete/:id", movieController.delete);
  movieRouter.get("/get-all", movieController.getAll);
  movieRouter.get("/get/:id", movieController.getById);
  movieRouter.get("/get-by-name/:name", movieController.getByName);

  return movieRouter;
};
