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
  options?: {
    headers?: Record<string, string>;
    method?: string;
    body?: any;
    waitForSelector?: string;
    waitTimeout?: number;
    enableJavaScript?: boolean;
    followRedirects?: boolean;
    maxDepth?: number;
    throttle?: number;
    proxy?: string;
    cookies?: string;
    captureScreenshot?: boolean;
    device?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface ScrapingResult {
  url: string;
  timestamp: string;
  data: Record<string, any>;
  success: boolean;
  error?: string;
  screenshot?: string; // Base64 encoded screenshot if requested
  metadata?: {
    statusCode?: number;
    contentType?: string;
    responseTime?: number;
    pageTitle?: string;
  };
}

export interface DatabaseConfig {
  table: string;
  columns: Record<string, string>; // Maps selector IDs to column names
  dbType?: "postgres" | "mysql" | "sqlite" | "mongodb";
  options?: {
    includeTimestamp?: boolean;
    includeUrl?: boolean;
    batchSize?: number;
  };
}

export interface ScrapeOptions {
  url: string;
  includeHeader: boolean;
  includeFooter: boolean;
  scrapeFullPage: boolean;
  scrapeImages: boolean;
  scrapeVideos: boolean;
  scrapeText: boolean;
  handleDynamicContent: boolean;
  maxPages?: number;
  waitTime?: number;
  selector?: string;
  loginRequired?: boolean;
  loginCredentials?: {
    username: string;
    password: string;
    usernameSelector: string;
    passwordSelector: string;
    submitSelector: string;
  };
  pagination?: {
    enabled: boolean;
    nextButtonSelector: string;
    maxPages: number;
  };
  aiOptions?: {
    performSentimentAnalysis: boolean;
    performNER: boolean;
    generateSummary: boolean;
    extractKeywords: boolean;
    categorizeContent: boolean;
  };
  exportOptions?: {
    format: "json" | "csv" | "xml" | "excel";
    saveToPublic: boolean;
    overwriteExisting: boolean;
  };
}

export interface ScrapeResult {
  id: string;
  url: string;
  timestamp: string;
  status: "in-progress" | "completed" | "failed";
  progress: number;
  error?: string;
  data: {
    text: string[];
    images: string[];
    videos: string[];
    tables: any[];
    lists: any[];
  };
  aiAnalysis?: {
    sentiment?: {
      overall: string;
      score: number;
    };
    entities?: {
      name: string;
      type: string;
      count: number;
    }[];
    summary?: string;
    keywords?: string[];
    categories?: string[];
  };
  metadata: {
    pageTitle: string;
    pageDescription: string;
    pageKeywords: string[];
    totalElements: number;
  };
  exportPath?: string;
}

// Mock implementation for client-side testing
class ScrapingService {
  private activeJobs: Map<string, ScrapeResult> = new Map();

  /**
   * Scrapes data from multiple URLs based on provided selectors
   */
  async scrapeMultipleUrls(
    targets: ScrapingTarget[],
  ): Promise<ScrapingResult[]> {
    try {
      const response = await axios.post("/api/scraping/scrape", { targets });
      return response.data;
    } catch (error) {
      console.error("Error in scrapeMultipleUrls:", error);
      throw new Error(`Failed to scrape multiple URLs: ${error.message}`);
    }
  }

  /**
   * Scrapes a single URL with the provided selectors
   */
  async scrapeUrl(
    url: string,
    selectors: SelectorConfig[],
    options?: ScrapingTarget["options"],
  ): Promise<ScrapingResult> {
    try {
      const response = await axios.post("/api/scraping/scrape", {
        targets: [{ url, selectors, options }],
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
  }

  /**
   * Saves scraping results to a database
   */
  async saveToDatabase(
    results: ScrapingResult[],
    dbConfig: DatabaseConfig,
  ): Promise<boolean> {
    try {
      const response = await axios.post("/api/scraping/save-db", {
        results,
        dbConfig,
      });
      return response.data.success;
    } catch (error: any) {
      console.error("Error saving scraping results to database:", error);
      throw new Error(`Failed to save results to database: ${error.message}`);
    }
  }

  /**
   * Saves scraping results to a file
   */
  async saveToFile(
    results: ScrapingResult[],
    filename: string,
    format: "json" | "csv" | "xml" | "excel" = "json",
  ): Promise<string> {
    try {
      const response = await axios.post("/api/scraping/save-file", {
        results,
        filename,
        format,
      });
      return response.data.filePath;
    } catch (error: any) {
      console.error("Error saving scraping results to file:", error);
      throw new Error(`Failed to save results to file: ${error.message}`);
    }
  }

  /**
   * Fetches HTML content from a URL for preview
   */
  async fetchHtmlPreview(url: string): Promise<string> {
    try {
      const response = await axios.post("/api/scraping/fetch-html", { url });
      return response.data.html;
    } catch (error: any) {
      console.error("Error fetching HTML preview:", error);
      throw new Error(`Failed to fetch HTML preview: ${error.message}`);
    }
  }

  /**
   * Tests a selector against a URL
   */
  async testSelector(
    url: string,
    selector: SelectorConfig,
  ): Promise<{ success: boolean; result: any; error?: string }> {
    try {
      const response = await axios.post("/api/scraping/test-selector", {
        url,
        selector,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error testing selector:", error);
      return {
        success: false,
        result: null,
        error: error.message || "An unknown error occurred",
      };
    }
  }

  /**
   * Validates a URL
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generates a filename based on URL and timestamp
   */
  generateFilename(url: string, format: string): string {
    const domain = new URL(url).hostname.replace(/\./g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `scraping_${domain}_${timestamp}.${format}`;
  }

  /**
   * Start a new scraping job
   */
  async startScraping(options: ScrapeOptions): Promise<string> {
    const jobId = Math.random().toString(36).substring(2, 15);
    const result: ScrapeResult = {
      id: jobId,
      url: options.url,
      timestamp: new Date().toISOString(),
      status: "in-progress",
      progress: 0,
      data: {
        text: [],
        images: [],
        videos: [],
        tables: [],
        lists: [],
      },
      metadata: {
        pageTitle: "",
        pageDescription: "",
        pageKeywords: [],
        totalElements: 0,
      },
    };

    this.activeJobs.set(jobId, result);

    // Simulate processing
    setTimeout(() => {
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = "completed";
        job.progress = 100;
        job.metadata.pageTitle = "Example Page";
        job.data.text = ["Sample text 1", "Sample text 2"];
        this.activeJobs.set(jobId, job);
      }
    }, 3000);

    return jobId;
  }

  /**
   * Get the status and results of a scraping job
   */
  getJobStatus(jobId: string): ScrapeResult | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get all scraping jobs
   */
  getAllJobs(): ScrapeResult[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Delete a scraping job
   */
  deleteJob(jobId: string): boolean {
    return this.activeJobs.delete(jobId);
  }
}

// Create a singleton instance
const scrapingService = new ScrapingService();

export default scrapingService;
