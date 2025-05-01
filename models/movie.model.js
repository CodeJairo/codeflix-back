import crypto from 'node:crypto';
import DBLocal from 'db-local';
import { formatDateToYYYYMMDD } from '../utils/format-date.js';
import {
  NotFoundError,
  AuthorizationError,
  InternalServerError,
  CustomError,
  ConflictError,
} from '../utils/custom-error.js';

const { Schema } = new DBLocal({ path: './db' });

const Movie = Schema('Movie', {
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
  static async createMovie({ title, description, release_date, duration_minutes, video_url, genre, createdBy }) {
    try {
      const movie = Movie.findOne({ title });
      const movieUrl = Movie.findOne({ video_url });
      if (movie || movieUrl) throw new ConflictError('Movie already exists');

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
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Movie creation failed');
    }
  }

  static async getAllMovies({ genre }) {
    try {
      if (genre) {
        return Movie.find({ isActive: true, genre: { $in: [genre] } });
      }
      return Movie.find({ isActive: true });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed getting movies');
    }
  }

  static async updateMovie({ isAdminUpdater, updaterUserId, movieId, partialMovie }) {
    try {
      const movie = await Movie.findOne({ _id: movieId });
      if (!movie) throw new NotFoundError('Movie not found');

      if (movie.createdBy === updaterUserId || isAdminUpdater === true) {
        return await movie
          .update({
            ...partialMovie,
            updatedAt: formatDateToYYYYMMDD(new Date()),
          })
          .save();
      }

      throw new AuthorizationError('You are not authorized to update this movie');
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed updating movie');
    }
  }

  static async deleteMovie({ isAdminDeleter, deleterUserId, movieId }) {
    try {
      const movie = await Movie.findOne({ _id: movieId });
      if (!movie) throw new NotFoundError('Movie not found');
      if (movie.createdBy === deleterUserId || isAdminDeleter === true) {
        return await movie.update({ isActive: false }).save();
      }
      throw new AuthorizationError('You are not authorized to delete this movie');
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed deleting movie');
    }
  }

  static async getMovieById({ movieId }) {
    try {
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) throw new NotFoundError('Movie not found');
      return movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed getting movie by ID');
    }
  }

  static async getMoviesByName({ title }) {
    try {
      if (title) {
        const lowerCaseTitle = title.toLowerCase();
        return await Movie.find({
          title: { $regex: lowerCaseTitle, $options: 'i' },
          isActive: true,
        });
      }
      return await Movie.find({ isActive: true });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed getting movies by name');
    }
  }
}
