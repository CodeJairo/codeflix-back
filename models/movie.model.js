import crypto from 'node:crypto';
import DBLocal from 'db-local';
import { formatDateToYYYYMMDD } from '../utils/format-date.js';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-error.js';

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
  static async createMovie({ data, createdBy }) {
    try {
      const { title, description, release_date, duration_minutes, video_url, genre } = data;
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
      throw new InternalServerError('User login failed');
    }
  }

  static async updateMovie({ movieId, partialMovie }) {
    try {
      let movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) throw new NotFoundError('Movie not found');
      movie = await movie.update({ ...partialMovie, updatedAt: formatDateToYYYYMMDD(new Date()) }).save();
      return movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed fetching movies');
    }
  }

  static async deleteMovie({ movieId }) {
    try {
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) throw new NotFoundError('Movie not found');
      return await movie.update({ isActive: false }).save();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed deleting movie');
    }
  }

  static async getAllMovies({ title, genre }) {
    try {
      // Case 1: both title and genre are provided
      if (title && genre) {
        return await Movie.find(
          m =>
            m.title.toLowerCase().includes(title.toLowerCase()) &&
            m.genre.some(g => genre.includes(g)) &&
            m.isActive === true
        );
      }

      // Case 2: only title is provided
      if (title) {
        return await Movie.find(m => m.title.toLowerCase().includes(title.toLowerCase()) && m.isActive === true);
      }

      // Case 3: only genre is provided
      if (genre) {
        return await Movie.find(m => m.genre.some(g => genre.includes(g)) && m.isActive === true);
      }

      // Case 4: neither title nor genre is provided
      return await Movie.find({ isActive: true });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed fetching movies');
    }
  }

  static async getMovieById({ id }) {
    try {
      const movie = await Movie.findOne({ _id: id, isActive: true });
      if (!movie) throw new NotFoundError('Movie not found');
      return movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed getting movie by ID');
    }
  }

  static async movieExists({ title, video_url }) {
    try {
      const movie = await Movie.findOne(
        m =>
          (m.title.toLowerCase() === title.toLowerCase() || m.video_url.toLowerCase() === video_url) &&
          m.isActive === true
      );
      return !!movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed checking movie existence');
    }
  }

  static async isMovieCreator({ userId, movieId }) {
    try {
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      // const movie = await Movie.findOne(m => m._id === movieId && m.isActive === true);
      if (!movie) throw new NotFoundError('Movie not found');
      if (movie.createdBy !== userId) return false;
      return true;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Failed checking movie creator');
    }
  }
}
