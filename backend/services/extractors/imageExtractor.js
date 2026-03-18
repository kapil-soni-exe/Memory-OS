export const extractImage = async (url) => {
  try {

    return {
      title: "Image",
      content: "Image saved",
      image: url,
      url
    };

  } catch (error) {

    console.log("Image extraction error:", error.message);
    return null;

  }
};