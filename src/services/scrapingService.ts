import axios from "axios";

export interface SelectorConfig {
  id: string;
  selector: string;
  name: string;
  attribute?: string; // Optional attribute to extract (e.g., 'href', 'src')
  type: "text" | "html" | "attribute" | "list";
  listItemSelector?: string; // For list type, selector for individual items
}

export interface ScrapingTarget {
  url: string;
  selectors: SelectorConfig[];
}

export interface ScrapingResult {
  url: string;
  timestamp: string;
  data: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface DatabaseConfig {
  table: string;
  columns: Record<string, string>; // Maps selector IDs to column names
}

/**
 * Scrapes data from multiple URLs based on provided selectors
 */
export const scrapeMultipleUrls = async (
  targets: ScrapingTarget[],
): Promise<ScrapingResult[]> => {
  try {
    const response = await axios.post("/api/scraping/scrape", { targets });
    return response.data;
  } catch (error) {
    console.error("Error in scrapeMultipleUrls:", error);
    throw new Error(`Failed to scrape multiple URLs: ${error.message}`);
  }
};

/**
 * Scrapes a single URL with the provided selectors
 */
export const scrapeUrl = async (
  url: string,
  selectors: SelectorConfig[],
): Promise<ScrapingResult> => {
  try {
    const response = await axios.post("/api/scraping/scrape", {
      targets: [{ url, selectors }],
    });
    return response.data[0];
  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      data: {},
      success: false,
      error: error.message,
    };
  }
};

/**
 * Saves scraping results to a database
 */
export const saveToDatabase = async (
  results: ScrapingResult[],
  dbConfig: DatabaseConfig,
): Promise<boolean> => {
  try {
    await axios.post("/api/scraping/save-db", {
      results,
      dbConfig,
    });
    return true;
  } catch (error) {
    console.error("Error saving scraping results to database:", error);
    throw new Error(`Failed to save results to database: ${error.message}`);
  }
};

/**
 * Saves scraping results to a file
 */
export const saveToFile = async (
  results: ScrapingResult[],
  filename: string,
): Promise<string> => {
  try {
    const response = await axios.post("/api/scraping/save-file", {
      results,
      filename,
    });
    return response.data.filePath;
  } catch (error) {
    console.error("Error saving scraping results to file:", error);
    throw new Error(`Failed to save results to file: ${error.message}`);
  }
};

export default {
  scrapeMultipleUrls,
  scrapeUrl,
  saveToDatabase,
  saveToFile,
};
