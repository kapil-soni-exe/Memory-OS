import keyword_extractor from "keyword-extractor";

export const extractKeywords = (text) => {
    const shortText = text.slice(0,2000);
  const extractionResult = keyword_extractor.extract(shortText, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true,
    remove_stopwords: true
  });

  return extractionResult.slice(0,10);
};
