import express from 'express';
import { createAuthRouter } from './routes/auth.route.js';
import { createMovieRouter } from './routes/movie.route.js';
import { corsMiddleware } from './middlewares/cors.js';
import cookieParser from 'cookie-parser';
import config from './config/config.js';

export const createApp = ({ emailService, authService, movieService }) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware());
  app.disable('x-powered-by');

  app.use('/public', express.static('public'));

  app.use(
    '/auth',
    createAuthRouter({
      emailService,
      authService,
    })
  );

  app.use('/movie', createMovieRouter({ movieService }));

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
};
