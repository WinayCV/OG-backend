const artworkValidationSchema = {
  title: {
    notEmpty: {
      errorMessage: "title cannot be empty",
    },
  },
  description: {
    notEmpty: {
      errorMessage: "description cannot be empty",
    },
  },
  images: {
    custom: {
      options: async (value, { req }) => {
        if (req.files.length < 3) {
          throw new Error("Minimum 3 image is require");
        } else {
          return true;
        }
      },
    },
  },
  searchTag: {
    notEmpty: {
      errorMessage: "Please add search tags ",
    },
    isArray: {
      options: { min: 2 },
      errorMessage: "Minimum 2 search tags are required",
    },
  },
};

module.exports = artworkValidationSchema;
