import {
  validateMovie,
  validatePartialMovie,
} from "../schemas/movie.schema.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  create = async (req, res) => {
    const validatedMovie = validateMovie(req.body);

    if (!validatedMovie.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validatedMovie.error.message) });
    }

    try {
      const movie = await this.movieModel.createMovie({
        ...validatedMovie.data,
        createdBy: req.user.id,
      });

      res.status(200).send(movie);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  update = async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Movie ID is required" });
    }
    const validatedMovie = validatePartialMovie(req.body);

    if (!validatedMovie.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validatedMovie.error.message) });
    }

    try {
      const updatedMovie = await this.movieModel.updateMovie({
        isAdminUpdater: req.user.isAdmin,
        updaterUserId: req.user.id,
        movieId: id,
        partialMovie: validatedMovie.data,
      });
      res.status(200).send(updatedMovie);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  delete = async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    try {
      await this.movieModel.deleteMovie({
        isAdminDeleter: req.user.isAdmin,
        deleterUserId: req.user.id,
        movieId: id,
      });
      res.status(200).send({ message: "Movie deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getAll = async (req, res) => {
    const { genre } = req.query;
    try {
      const movies = await this.movieModel.getAllMovies({ genre });
      res.status(200).send(movies);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getById = async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    try {
      const movie = await this.movieModel.getMovieById({ movieId: id });
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.status(200).send(movie);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getByName = async (req, res) => {
    const { title } = req.query;
    try {
      const movies = await this.movieModel.getMoviesByName({ title });
      res.status(200).send(movies);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}
