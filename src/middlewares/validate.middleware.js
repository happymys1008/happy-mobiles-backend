export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    return next();
  }

  const message = result.error.issues[0]?.message || "Invalid request";
  const err = new Error(message);
  err.statusCode = 400;
  return next(err);
};
