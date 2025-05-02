import { CustomError } from '../utils/custom-error.js';

export class MovieController {
  constructor({ movieService }) {
    this.movieService = movieService;
  }

  create = async (req, res) => {
    try {
      const movie = await this.movieService.createMovie({ data: req.body, createdBy: req.user.id });
      res.status(200).json(movie);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  update = async (req, res) => {
    try {
      const { id: movieId } = req.params;

      const updatedMovie = await this.movieService.updateMovie({
        user: req.user,
        movieId,
        partialMovie: req.body,
      });
      res.status(200).send(updatedMovie);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.movieService.deleteMovie({ user: req.user, movieId: id });
      res.status(200).send({ message: 'Movie deleted successfully' });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  getAll = async (req, res) => {
    try {
      const { title, genre } = req.query;
      const movies = await this.movieService.getAllMovies({ title, genre });
      res.status(200).send(movies);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await this.movieService.getMovieById({ id });
      res.status(200).send(movie);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  #handleError = (error, res) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  };
}
