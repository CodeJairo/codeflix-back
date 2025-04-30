export const validateRequest = (validateMethod) => (req, res, next) => {
  const validationResult = validateMethod(req.body);
  if (!validationResult.success) {
    const errorMessagesArray = JSON.parse(validationResult.error.message);
    const errorMessages = errorMessagesArray
      .map((error) => error.message)
      .join(", ");
    return res.status(422).json({ message: errorMessages });
  }
  next();
};
