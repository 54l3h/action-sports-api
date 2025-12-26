export const stripImagesFromBody = (req, res, next) => {
  delete req.body.images;
  next();
};
