import z from 'zod';

const movieSchema = z.object({
  title: z
    .string({
      invalid_type_error: 'Title must be a string',
      required_error: 'Title is required',
    })
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(50, { message: 'Must be 50 or fewer characters long' }),

  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(10, { message: 'Must be 10 or more characters long' })
    .max(500, { message: 'Must be 500 or fewer characters long' }),

  release_date: z.string({ required_error: 'Release date is required' }).refine(
    date => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    { message: 'Release date must be a valid date (e.g., YYYY-MM-DD)' }
  ),

  duration_minutes: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number',
    })
    .min(5, { message: 'Must be 5 or more minutes long' })
    .max(180, { message: 'Must be 180 or fewer minutes long' }),

  video_url: z
    .string({
      invalid_type_error: 'Video url must be a string',
      required_error: 'Video url is required',
    })
    .url({ message: 'Video url must be a valid URL' }),

  genre: z
    .array(
      z.enum([
        'action',
        'comedy',
        'drama',
        'horror',
        'romance',
        'sci-fi',
        'thriller',
        'fantasy',
        'documentary',
        'animation',
      ]),
      {
        invalid_type_error: 'Genre must be an array of strings',
        required_error: 'Genre is required',
      }
    )
    .nonempty({ message: 'Genre must be a non-empty array' }),
});

export function validateMovie(movie) {
  return movieSchema.safeParse(movie);
}

export function validatePartialMovie(movie) {
  return movieSchema.partial().safeParse(movie);
}
