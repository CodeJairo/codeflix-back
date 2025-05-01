import { CustomError } from '../utils/custom-error.js';

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  create = async (req, res) => {
    try {
      const movie = await this.movieModel.createMovie({
        ...req.body,
        createdBy: req.user.id,
      });
      res.status(200).send(movie);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMovie = await this.movieModel.updateMovie({
        isAdminUpdater: req.user.isAdmin,
        updaterUserId: req.user.id,
        movieId: id,
        partialMovie: req.body,
      });
      res.status(200).send(updatedMovie);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.movieModel.deleteMovie({
        isAdminDeleter: req.user.isAdmin,
        deleterUserId: req.user.id,
        movieId: id,
      });
      res.status(200).send({ message: 'Movie deleted successfully' });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  getAll = async (req, res) => {
    try {
      const { genre } = req.query;
      const movies = await this.movieModel.getAllMovies({ genre });
      res.status(200).send(movies);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await this.movieModel.getMovieById({ movieId: id });
      res.status(200).send(movie);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  getByName = async (req, res) => {
    try {
      const { title } = req.query;
      const movies = await this.movieModel.getMoviesByName({ title });
      res.status(200).send(movies);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
