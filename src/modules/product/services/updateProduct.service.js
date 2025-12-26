export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. Strip images from body so they aren't overwritten by empty inputs
  const { images, ...restOfBody } = req.body;
  let updateData = { ...restOfBody };

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // 2. Handle Multiple Images Upload
  if (req.files && req.files.length > 0) {
    let newImages = [];

    for (const file of req.files) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `${file.fieldname}-${uniqueSuffix}`;

      try {
        const uploadResult = await cloud.uploader.upload(dataUri, {
          folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/products`,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
        });

        newImages.push({
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        });
      } catch (err) {
        return next(err);
      }
    }

    // Use $push operator to append to the existing array in the DB
    updateData.$push = { images: { $each: newImages } };
  }

  // 3. Perform Update
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});
