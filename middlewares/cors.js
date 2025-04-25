import cors from "cors";

const AllowedOrigins = ["http://localhost:3000"];

export const corsMiddleware = ({ allowedOrigins = AllowedOrigins } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!origin) return callback(null, true);
      return callback(
        new Error(`CORS error: Origin ${origin} is not allowed.`)
      );
    },
  });
