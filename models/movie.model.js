import crypto from "node:crypto";
import DBLocal from "db-local";
import { formatDateToYYYYMMDD } from "../utils/format-date.js";

const { Schema } = new DBLocal({ path: "./db" });

const Movie = Schema("Movie", {
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: Array, required: true },
  duration_minutes: { type: Number, required: true },
  release_date: { type: Date, required: true },
  video_url: { type: String, required: true },
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
  updatedAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
});

export class MovieModel {
  static async createMovie({
    title,
    description,
    release_date,
    duration_minutes,
    video_url,
    genre,
    createdBy,
  }) {
    try {
      const movie = Movie.findOne({ title });
      const movieUrl = Movie.findOne({ video_url });
      if (movie || movieUrl) throw new Error("Movie already exists");

      const id = crypto.randomUUID();
      const newMovie = Movie.create({
        _id: id,
        title,
        description,
        release_date,
        duration_minutes,
        video_url,
        genre,
        createdBy,
      }).save();

      return newMovie;
    } catch (error) {
      throw new Error("Movie creation failed: " + error.message);
    }
  }

  static async getAllMovies({ genre }) {
    if (genre) {
      return Movie.find({ isActive: true, genre: { $in: [genre] } });
    }
    return Movie.find({ isActive: true });
  }

  static async updateMovie({
    isAdminUpdater,
    updaterUserId,
    movieId,
    partialMovie,
  }) {
    const movie = await Movie.findOne({ _id: movieId });
    if (!movie) throw new Error("Movie not found");
    if (movie.createdBy === updaterUserId || isAdminUpdater === true) {
      return await movie
        .update({
          ...partialMovie,
          updatedAt: formatDateToYYYYMMDD(new Date()),
        })
        .save();
    }
    throw new Error("Unauthorized");
  }

  static async deleteMovie({ isAdminDeleter, deleterUserId, movieId }) {
    const movie = await Movie.findOne({ _id: movieId });
    if (!movie) throw new Error("Movie not found");
    if (movie.createdBy === deleterUserId || isAdminDeleter === true) {
      return await movie.update({ isActive: false }).save();
    }
    throw new Error("Unauthorized");
  }
}
