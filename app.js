import express from "express";
import { createAuthRouter } from "./routes/auth.route.js";
import { corsMiddleware } from "./middlewares/cors.js";
import cookieParser from "cookie-parser";
import { createMovieRouter } from "./routes/movie.route.js";

export const createApp = ({ authModel, movieModel }) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware());
  app.disable("x-powered-by");
  const PORT = process.env.PORT ?? 3000;

  app.use("/auth", createAuthRouter({ authModel }));
  app.use("/movie", createMovieRouter({ movieModel }));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
