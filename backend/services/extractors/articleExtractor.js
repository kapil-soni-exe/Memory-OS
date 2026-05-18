import Mercury from "@postlight/mercury-parser";
import * as cheerio from "cheerio";

/**
 * Article Extractor
 * Uses Mercury Parser as primary engine with a Cheerio fallback for SPA/Docs
 */
export const extractArticle = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // 1. Primary: Mercury Parser (Best for Clean Articles)
    let result = null;
    try {
        result = await Mercury.parse(url, { html });
    } catch (e) {
        console.warn(`[Extractor] Mercury failed: ${e.message}`);
    }

    let finalContent = result?.content || "";
    let finalTitle = result?.title || "";
    let finalImage = result?.lead_image_url || "";
    let finalAuthor = result?.author || null;

    // 2. Fallback: Cheerio (Best for Documentation/SPA where Mercury fails)
    // If Mercury returns empty or very short content, we use Cheerio to grab the main text
    if (!finalContent || finalContent.length < 150) {
        console.log(`[Extractor] Mercury content insufficient. Running Cheerio fallback...`);
        const $ = cheerio.load(html);

        // Remove noise (nav, scripts, ads)
        $('nav, footer, aside, .sidebar, .menu, script, style, noscript, .ads, .ad-section, head').remove();

        // Target common Documentation/Article content areas
        const contentSelectors = [
            'article', 'main', '.content', '#content', '.markdown', 
            '.docs-content', '#docs-content', '.prose', '.post-content',
            '[role="main"]'
        ];
        
        let extractedBody = "";

        for (const selector of contentSelectors) {
            const el = $(selector);
            if (el.length > 0) {
                extractedBody = el.text().trim();
                if (extractedBody.length > 200) break;
            }
        }

        // Final desperation: Just take the largest text container in the body
        if (!extractedBody || extractedBody.length < 200) {
            extractedBody = $('body').text().trim();
        }

        // Clean up whitespace and restrict length
        finalContent = extractedBody
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .slice(0, 15000); 

        if (!finalTitle) {
            finalTitle = $('h1').first().text().trim() || $('title').text().trim() || "Untitled Article";
        }
    }

    return {
      title: finalTitle,
      content: finalContent,
      author: finalAuthor,
      image: finalImage,
      url
    };

  } catch (error) {
    console.error("Extraction error:", error.message);
    return {
        title: "Extraction Failed",
        content: `Could not extract content from ${url}. Error: ${error.message}`,
        url
    };
  }
};