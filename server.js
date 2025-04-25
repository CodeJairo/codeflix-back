import { createApp } from "./app.js";
import { AuthModel } from "./models/auth.model.js";
import { MovieModel } from "./models/movie.model.js";
createApp({ authModel: AuthModel, movieModel: MovieModel });
