import axios from "axios";
import { getMySQLClient, QueryTypes } from "@/services/mysqlClient";
import { v4 as uuidv4 } from "uuid";

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
  skipHeadersFooters: boolean;
  skipMedia: boolean;
  waitForDynamicContent: boolean;
  respectRobotsTxt: boolean;
  stealthMode: boolean;
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
    enabled: boolean;
    cleaningLevel: "basic" | "thorough" | "semantic";
    extractStructuredData: boolean;
    performSentimentAnalysis: boolean;
    extractEntities: boolean;
    generateSummary: boolean;
    extractKeywords: boolean;
    categorizeContent: boolean;
  };
  exportOptions?: {
    format: "json" | "csv" | "xml" | "excel" | "text";
    includeMetadata: boolean;
    useSemanticKeys: boolean;
    extractLinks: boolean;
    extractImages: boolean;
    extractTables: boolean;
    saveToPublic: boolean;
    overwriteExisting: boolean;
    customFilename: string;
  };
  securityOptions?: {
    enableProxy: boolean;
    proxyUrl: string;
    rateLimitDelay: number;
    maxRetries: number;
    followRedirects: boolean;
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
    links?: string[];
    structuredData?: Record<string, any>;
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
    structuredData?: Record<string, any>;
    cleanedText?: string;
  };
  metadata: {
    pageTitle: string;
    pageDescription: string;
    pageKeywords: string[];
    totalElements: number;
    statusCode?: number;
    contentType?: string;
    responseTime?: number;
    robotsTxtStatus?: string;
    removedElements?: {
      headers?: number;
      footers?: number;
      ads?: number;
      media?: number;
    };
  };
  exportPath?: string;
  exportFormat?: string;
}

class ScrapingService {
  private activeJobs: Map<string, ScrapeResult> = new Map();
  private batchSize = 5; // Number of URLs to process in parallel
  private retryLimit = 3; // Number of retries for failed requests
  private retryDelay = 1000; // Delay between retries in ms

  /**
   * Scrapes data from multiple URLs based on provided selectors
   * Enhanced to process URLs in parallel batches with retry logic
   */
  async scrapeMultipleUrls(
    targets: ScrapingTarget[],
  ): Promise<ScrapingResult[]> {
    try {
      const results: ScrapingResult[] = [];

      // Process URLs in batches to avoid overwhelming the server
      for (let i = 0; i < targets.length; i += this.batchSize) {
        const batch = targets.slice(i, i + this.batchSize);
        const batchPromises = batch.map((target) =>
          this.scrapeWithRetry(target.url, target.selectors, target.options),
        );

        // Wait for all promises in the current batch to resolve
        const batchResults = await Promise.allSettled(batchPromises);

        // Process results, including both fulfilled and rejected promises
        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          } else {
            // Create an error result for failed requests
            results.push({
              url: batch[index].url,
              timestamp: new Date().toISOString(),
              data: {},
              success: false,
              error: result.reason?.message || "Failed to scrape URL",
            });
          }
        });

        // Add a small delay between batches to avoid rate limiting
        if (i + this.batchSize < targets.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return results;
    } catch (error) {
      console.error("Error in scrapeMultipleUrls:", error);
      throw new Error(`Failed to scrape multiple URLs: ${error.message}`);
    }
  }

  /**
   * Scrapes a single URL with retry logic
   */
  private async scrapeWithRetry(
    url: string,
    selectors: SelectorConfig[],
    options?: ScrapingTarget["options"],
  ): Promise<ScrapingResult> {
    let attempts = 0;
    let lastError: any;

    while (attempts < this.retryLimit) {
      try {
        const response = await axios.post("/api/scraping/scrape", {
          targets: [{ url, selectors, options }],
        });
        return response.data[0];
      } catch (error) {
        lastError = error;
        attempts++;

        // Wait before retrying
        if (attempts < this.retryLimit) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempts),
          );
        }
      }
    }

    // All retries failed
    console.error(
      `Error scraping URL ${url} after ${attempts} attempts:`,
      lastError,
    );
    return {
      url,
      timestamp: new Date().toISOString(),
      data: {},
      success: false,
      error: lastError?.message || `Failed after ${attempts} attempts`,
    };
  }

  /**
   * Scrapes a single URL with the provided selectors
   */
  async scrapeUrl(
    url: string,
    selectors: SelectorConfig[],
    options?: ScrapingTarget["options"],
  ): Promise<ScrapingResult> {
    return this.scrapeWithRetry(url, selectors, options);
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
      const response = await axios.post("/api/scraping/fetch", { url });
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
   * Start a new scraping job with AI processing
   */
  async startScraping(options: ScrapeOptions): Promise<string> {
    try {
      // Generate a unique job ID
      const jobId = uuidv4();

      // Create initial job state
      const initialState: ScrapeResult = {
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

      // Store the job state
      this.activeJobs.set(jobId, initialState);

      // Start the scraping process asynchronously
      this.processScraping(jobId, options).catch((error) => {
        console.error(`Error processing job ${jobId}:`, error);
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.status = "failed";
          job.error = error.message;
          this.activeJobs.set(jobId, job);
        }
      });

      return jobId;
    } catch (error) {
      console.error("Error starting scraping job:", error);
      throw new Error(`Failed to start scraping job: ${error.message}`);
    }
  }

  /**
   * Process a scraping job with progress tracking
   */
  private async processScraping(
    jobId: string,
    options: ScrapeOptions,
  ): Promise<void> {
    try {
      // Get the job state
      const job = this.activeJobs.get(jobId);
      if (!job) throw new Error(`Job ${jobId} not found`);

      // Update progress
      job.progress = 10;
      this.activeJobs.set(jobId, job);

      // Call the API to start the scraping job
      const response = await axios.post("/api/scraping/start-job", {
        options,
        jobId,
      });

      // Update job with initial results
      job.progress = 50;
      job.metadata = {
        ...job.metadata,
        ...response.data.metadata,
      };
      this.activeJobs.set(jobId, job);

      // If AI processing is enabled, run it
      if (options.aiOptions?.enabled) {
        await this.runAIAnalysis(jobId, options.aiOptions);
      }

      // Mark job as completed
      job.status = "completed";
      job.progress = 100;
      this.activeJobs.set(jobId, job);
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error);
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = "failed";
        job.error = error.message;
        job.progress = 0;
        this.activeJobs.set(jobId, job);
      }
      throw error;
    }
  }

  /**
   * Run AI analysis on scraped content
   */
  async runAIAnalysis(
    resultId: string,
    options: ScrapeOptions["aiOptions"],
  ): Promise<any> {
    try {
      // Get the job state
      const job = this.activeJobs.get(resultId);
      if (!job) throw new Error(`Job ${resultId} not found`);

      // Update progress
      job.progress = 60;
      this.activeJobs.set(resultId, job);

      // Call the API to run AI analysis
      const response = await axios.post("/api/scraping/analyze", {
        resultId,
        options,
      });

      // Update job with AI analysis results
      job.progress = 90;
      job.aiAnalysis = response.data.aiAnalysis;
      this.activeJobs.set(resultId, job);

      return response.data;
    } catch (error) {
      console.error("Error running AI analysis:", error);
      throw new Error(`Failed to run AI analysis: ${error.message}`);
    }
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
