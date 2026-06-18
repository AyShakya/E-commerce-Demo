export const validate =
  (schema) => (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || "Invalid input",
      });
    }
  };
