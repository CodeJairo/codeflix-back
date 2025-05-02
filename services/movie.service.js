import { ConflictError, CustomError, InternalServerError, AuthorizationError } from '../utils/custom-error.js';

export class MovieService {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  async createMovie({ data, createdBy }) {
    try {
      const { title, video_url } = data;
      const movieExists = await this.movieModel.movieExists({ title, video_url });
      if (movieExists === true) throw new ConflictError('Movie already exists');
      return await this.movieModel.createMovie({ data, createdBy });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.log(error);
      throw new InternalServerError('Error creating movie');
    }
  }

  async updateMovie({ user, movieId, partialMovie }) {
    try {
      const isMovieCreator = await this.movieModel.isMovieCreator({ userId: user.id, movieId });
      if (user.isAdmin || isMovieCreator) return await this.movieModel.updateMovie({ movieId, partialMovie });
      throw new AuthorizationError('You are not authorized to update this movie');
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error updating movie');
    }
  }

  async deleteMovie({ user, movieId }) {
    try {
      const isMovieCreator = await this.movieModel.isMovieCreator({ userId: user.id, movieId });
      if (user.isAdmin || isMovieCreator) return await this.movieModel.deleteMovie({ movieId });
      throw new AuthorizationError('You are not authorized to delete this movie');
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error deleting movie');
    }
  }

  async getAllMovies({ title, genre }) {
    try {
      if (genre) genre = genre.split(',').map(g => g.trim());
      const movies = await this.movieModel.getAllMovies({ title, genre });
      return movies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error fetching movies');
    }
  }

  async getMovieById({ id }) {
    try {
      const movie = await this.movieModel.getMovieById({ id });
      return movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error fetching movie');
    }
  }
}
