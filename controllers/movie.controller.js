import { validateMovie } from "../schemas/movie.schema.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  create = async (req, res) => {
    const validationMovie = validateMovie(req.body);
    if (!validationMovie.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validationMovie.error.message) });
    }
    const {
      title,
      description,
      release_date,
      duration_minutes,
      video_url,
      genre,
    } = validationMovie.data;

    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    try {
      const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
      const { id: createdBy } = decodedToken;
      console.log(createdBy);
      const movie = await this.movieModel.createMovie({
        title,
        description,
        release_date,
        duration_minutes,
        video_url,
        genre,
        createdBy,
      });

      res.status(200).send(movie);
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
}
