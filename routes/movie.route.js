import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { validateMovie, validatePartialMovie } from '../schemas/movie.schema.js';

export const createMovieRouter = ({ authModel, movieService }) => {
  const movieRouter = Router();

  const movieController = new MovieController({ movieService });

  movieRouter.post(
    '/create',
    authenticate(authModel.getUserById),
    validateRequest(validateMovie),
    movieController.create
  );
  movieRouter.patch(
    '/update/:id',
    authenticate(authModel.getUserById),
    validateRequest(validatePartialMovie),
    movieController.update
  );

  movieRouter.delete('/delete/:id', authenticate(authModel.getUserById), movieController.delete);
  movieRouter.get('/get-all', movieController.getAll);
  movieRouter.get('/get/:id', movieController.getById);
  movieRouter.get('/get-by-name', movieController.getByName);

  return movieRouter;
};
