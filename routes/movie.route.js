import { Router } from "express";
import { MovieController } from "../controllers/movie.controller.js";
import { authenticate } from "../middlewares/auth.js";

export const createMovieRouter = ({ authModel, movieModel, config }) => {
  const movieRouter = Router();

  const movieController = new MovieController({ movieModel });

  movieRouter.post(
    "/create",
    authenticate(authModel.getUserById),
    movieController.create
  );
  movieRouter.patch(
    "/update/:id",
    authenticate(authModel.getUserById),
    movieController.update
  );
  movieRouter.delete(
    "/delete/:id",
    authenticate(authModel.getUserById),
    movieController.delete
  );
  movieRouter.get("/get-all", movieController.getAll);
  movieRouter.get("/get/:id", movieController.getById);
  movieRouter.get("/get-by-name", movieController.getByName);

  return movieRouter;
};
