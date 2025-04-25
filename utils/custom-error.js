//TODO: Add a custom error class to handle errors in a more structured way
// and avoid providing sensitive information to the client.

export class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
  }
}
