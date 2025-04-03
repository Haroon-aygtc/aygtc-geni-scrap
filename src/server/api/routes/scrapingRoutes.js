const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require("uuid");
const { Parser } = require("json2csv");
const xmlbuilder = require("xmlbuilder2");
const ExcelJS = require("exceljs");
const mysql = require("mysql2/promise");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

// Database connection pool
let dbPool;
try {
  dbPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "scraping_data",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} catch (error) {
  console.error("Error creating MySQL connection pool:", error);
}

// Create data directories if they don't exist
const dataDir = path.join(__dirname, "../../../data");
const scrapingDir = path.join(dataDir, "scraping");
const publicDir = path.join(__dirname, "../../../public/data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(scrapingDir)) {
  fs.mkdirSync(scrapingDir, { recursive: true });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Active scraping jobs
const activeJobs = new Map();

// Helper function to validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

// Helper function to generate a filename based on URL and timestamp
function generateFilename(url, format) {
  try {
    const domain = new URL(url).hostname.replace(/\./g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `scraping_${domain}_${timestamp}.${format}`;
  } catch (error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `scraping_data_${timestamp}.${format}`;
  }
}

// Helper function to create a table in MySQL if it doesn't exist
async function createTableIfNotExists(tableName, columns) {
  if (!dbPool) return false;

  try {
    const connection = await dbPool.getConnection();

    // Create a basic table structure with id, url, and timestamp
    let createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(2048) NOT NULL,
      timestamp DATETIME NOT NULL`;

    // Add columns for each selector
    for (const [columnName, columnType] of Object.entries(columns)) {
      // Sanitize column name and use TEXT as default type
      const sanitizedColumnName = columnName
        .replace(/[^a-z0-9_]/gi, "_")
        .toLowerCase();
      createTableSQL += `,\n      ${sanitizedColumnName} ${columnType || "TEXT"}`;
    }

    createTableSQL += "\n    )";

    await connection.execute(createTableSQL);
    connection.release();
    return true;
  } catch (error) {
    console.error("Error creating table:", error);
    return false;
  }
}

// Helper function to insert data into MySQL
async function insertDataIntoTable(tableName, data) {
  if (!dbPool) return false;

  try {
    const connection = await dbPool.getConnection();

    // For each row of data
    for (const row of data) {
      const columns = Object.keys(row).map((col) =>
        col.replace(/[^a-z0-9_]/gi, "_").toLowerCase(),
      );
      const placeholders = columns.map(() => "?").join(", ");
      const values = Object.values(row);

      const insertSQL = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

      await connection.execute(insertSQL, values);
    }

    connection.release();
    return true;
  } catch (error) {
    console.error("Error inserting data into table:", error);
    return false;
  }
}

// Helper function to export data to various formats
async function exportData(data, format, filename, saveToPublic = false) {
  const baseDir = saveToPublic ? publicDir : scrapingDir;
  let filePath;

  try {
    switch (format.toLowerCase()) {
      case "json":
        filePath = path.join(baseDir, `${filename}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        break;

      case "csv":
        filePath = path.join(baseDir, `${filename}.csv`);
        // Flatten nested objects for CSV
        const flattenedData = data.map((item) => {
          const flattened = {};
          for (const [key, value] of Object.entries(item)) {
            if (typeof value === "object" && value !== null) {
              for (const [nestedKey, nestedValue] of Object.entries(value)) {
                flattened[`${key}_${nestedKey}`] = nestedValue;
              }
            } else {
              flattened[key] = value;
            }
          }
          return flattened;
        });

        const parser = new Parser();
        const csv = parser.parse(flattenedData);
        fs.writeFileSync(filePath, csv);
        break;

      case "xml":
        filePath = path.join(baseDir, `${filename}.xml`);
        const root = xmlbuilder.create({ root: { item: data } });
        fs.writeFileSync(filePath, root.end({ prettyPrint: true }));
        break;

      case "excel":
        filePath = path.join(baseDir, `${filename}.xlsx`);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Scraped Data");

        // Add headers
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          worksheet.addRow(headers);

          // Add data rows
          data.forEach((item) => {
            const row = [];
            headers.forEach((header) => {
              let value = item[header];
              if (typeof value === "object" && value !== null) {
                value = JSON.stringify(value);
              }
              row.push(value);
            });
            worksheet.addRow(row);
          });
        }

        await workbook.xlsx.writeFile(filePath);
        break;

      case "text":
        filePath = path.join(baseDir, `${filename}.txt`);
        let textContent = "";
        data.forEach((item, index) => {
          textContent += `--- Item ${index + 1} ---\n`;
          for (const [key, value] of Object.entries(item)) {
            if (typeof value === "object" && value !== null) {
              textContent += `${key}: ${JSON.stringify(value)}\n`;
            } else {
              textContent += `${key}: ${value}\n`;
            }
          }
          textContent += "\n";
        });
        fs.writeFileSync(filePath, textContent);
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return {
      success: true,
      filePath: filePath.replace(/\\/g, "/"),
      format,
    };
  } catch (error) {
    console.error(`Error exporting data to ${format}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Route to fetch HTML content from a URL
router.post("/fetch", async (req, res) => {
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    res.json({ html });
  } catch (error) {
    console.error("Error fetching HTML:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to test a selector against a URL
router.post("/test-selector", async (req, res) => {
  const { url, selector } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  if (!selector || !selector.selector) {
    return res.status(400).json({ error: "Invalid selector provided" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    let result;

    // Extract data based on selector type
    if (selector.type === "text") {
      result = await page.$$eval(selector.selector, (elements) =>
        elements.map((el) => el.textContent.trim()),
      );
    } else if (selector.type === "html") {
      result = await page.$$eval(selector.selector, (elements) =>
        elements.map((el) => el.outerHTML),
      );
    } else if (selector.type === "attribute" && selector.attribute) {
      result = await page.$$eval(
        selector.selector,
        (elements, attribute) =>
          elements.map((el) => el.getAttribute(attribute)),
        selector.attribute,
      );
    } else if (selector.type === "list" && selector.listItemSelector) {
      result = await page.$$eval(
        selector.selector,
        (elements, listItemSelector) => {
          return elements.map((el) => {
            const items = Array.from(el.querySelectorAll(listItemSelector));
            return items.map((item) => item.textContent.trim());
          });
        },
        selector.listItemSelector,
      );
    } else {
      result = await page.$$eval(selector.selector, (elements) =>
        elements.map((el) => el.textContent.trim()),
      );
    }

    await browser.close();

    res.json({
      success: true,
      result: result.flat(),
      count: result.flat().length,
    });
  } catch (error) {
    console.error("Error testing selector:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Route to scrape a single URL or multiple URLs
router.post("/scrape", async (req, res) => {
  const { targets } = req.body;

  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: "Invalid targets provided" });
  }

  try {
    const results = [];
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const target of targets) {
      const { url, selectors, options = {} } = target;

      if (!url || !isValidUrl(url)) {
        results.push({
          url,
          timestamp: new Date().toISOString(),
          data: {},
          success: false,
          error: "Invalid URL provided",
        });
        continue;
      }

      try {
        const page = await browser.newPage();

        // Set viewport if provided
        if (options.viewport) {
          await page.setViewport(options.viewport);
        }

        // Set custom headers if provided
        if (options.headers) {
          await page.setExtraHTTPHeaders(options.headers);
        }

        // Set cookies if provided
        if (options.cookies) {
          const cookieStr = options.cookies;
          const cookies = cookieStr.split(";").map((cookie) => {
            const [name, value] = cookie.trim().split("=");
            return { name, value, domain: new URL(url).hostname };
          });
          await page.setCookie(...cookies);
        }

        // Navigate to URL
        const startTime = Date.now();
        const response = await page.goto(url, {
          waitUntil: options.enableJavaScript
            ? "networkidle2"
            : "domcontentloaded",
          timeout: 30000,
          followRedirect: options.followRedirects !== false,
        });
        const responseTime = Date.now() - startTime;

        // Wait for specific selector if provided
        if (options.waitForSelector) {
          await page.waitForSelector(options.waitForSelector, {
            timeout: options.waitTimeout || 5000,
          });
        }

        // Capture screenshot if requested
        let screenshot;
        if (options.captureScreenshot) {
          screenshot = await page.screenshot({ encoding: "base64" });
        }

        // Extract metadata
        const title = await page.title();
        const metadata = {
          pageTitle: title,
          statusCode: response.status(),
          contentType: response.headers()["content-type"],
          responseTime,
        };

        // Extract data for each selector
        const data = {};
        for (const selector of selectors) {
          try {
            let extractedData;

            if (selector.type === "text") {
              extractedData = await page.$$eval(selector.selector, (elements) =>
                elements.map((el) => el.textContent.trim()),
              );
            } else if (selector.type === "html") {
              extractedData = await page.$$eval(selector.selector, (elements) =>
                elements.map((el) => el.outerHTML),
              );
            } else if (selector.type === "attribute" && selector.attribute) {
              extractedData = await page.$$eval(
                selector.selector,
                (elements, attribute) =>
                  elements.map((el) => el.getAttribute(attribute)),
                selector.attribute,
              );
            } else if (selector.type === "list" && selector.listItemSelector) {
              extractedData = await page.$$eval(
                selector.selector,
                (elements, listItemSelector) => {
                  return elements.map((el) => {
                    const items = Array.from(
                      el.querySelectorAll(listItemSelector),
                    );
                    return items.map((item) => item.textContent.trim());
                  });
                },
                selector.listItemSelector,
              );
            } else {
              extractedData = await page.$$eval(selector.selector, (elements) =>
                elements.map((el) => el.textContent.trim()),
              );
            }

            data[selector.id] = extractedData.flat();
          } catch (selectorError) {
            console.error(
              `Error extracting data for selector ${selector.name}:`,
              selectorError,
            );
            data[selector.id] = { error: selectorError.message };
          }
        }

        await page.close();

        results.push({
          url,
          timestamp: new Date().toISOString(),
          data,
          success: true,
          metadata,
          screenshot,
        });
      } catch (targetError) {
        console.error(`Error scraping URL ${url}:`, targetError);
        results.push({
          url,
          timestamp: new Date().toISOString(),
          data: {},
          success: false,
          error: targetError.message,
        });
      }

      // Add delay between requests if throttling is enabled
      if (options.throttle && targets.indexOf(target) < targets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, options.throttle));
      }
    }

    await browser.close();
    res.json(results);
  } catch (error) {
    console.error("Error in scrape endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to save scraping results to a file
router.post("/save-file", async (req, res) => {
  const { results, filename, format = "json", saveToPublic = false } = req.body;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: "Invalid results provided" });
  }

  try {
    const sanitizedFilename = filename
      ? sanitizeFilename(filename)
      : generateFilename(results[0]?.url || "data", format);
    const exportResult = await exportData(
      results,
      format,
      sanitizedFilename,
      saveToPublic,
    );

    if (exportResult.success) {
      res.json({
        success: true,
        filePath: exportResult.filePath,
        format: exportResult.format,
      });
    } else {
      res.status(500).json({
        success: false,
        error: exportResult.error,
      });
    }
  } catch (error) {
    console.error("Error saving to file:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to save scraping results to database
router.post("/save-db", async (req, res) => {
  const { results, dbConfig } = req.body;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: "Invalid results provided" });
  }

  if (!dbConfig || !dbConfig.table) {
    return res.status(400).json({ error: "Invalid database configuration" });
  }

  try {
    if (!dbPool) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    // Prepare data for database insertion
    const dataToInsert = [];

    for (const result of results) {
      if (!result.success) continue;

      const row = {
        url: result.url,
        timestamp: new Date(result.timestamp)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
      };

      // Map selector data to columns
      for (const [selectorId, columnName] of Object.entries(dbConfig.columns)) {
        const selectorData = result.data[selectorId];
        if (Array.isArray(selectorData)) {
          row[columnName] = selectorData.join(", ");
        } else if (selectorData !== undefined) {
          row[columnName] = selectorData;
        }
      }

      // Add metadata if requested
      if (dbConfig.options?.includeMetadata && result.metadata) {
        for (const [key, value] of Object.entries(result.metadata)) {
          row[`metadata_${key}`] = value;
        }
      }

      dataToInsert.push(row);
    }

    if (dataToInsert.length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    // Create columns mapping for table creation
    const columns = {};
    for (const [columnName] of Object.entries(dbConfig.columns)) {
      columns[columnName] = "TEXT";
    }

    // Add metadata columns if needed
    if (dbConfig.options?.includeMetadata) {
      columns["metadata_pageTitle"] = "VARCHAR(255)";
      columns["metadata_statusCode"] = "INT";
      columns["metadata_contentType"] = "VARCHAR(255)";
      columns["metadata_responseTime"] = "INT";
    }

    // Create table if it doesn't exist
    await createTableIfNotExists(dbConfig.table, columns);

    // Insert data into table
    const insertResult = await insertDataIntoTable(
      dbConfig.table,
      dataToInsert,
    );

    if (insertResult) {
      res.json({
        success: true,
        message: `Successfully inserted ${dataToInsert.length} rows into ${dbConfig.table}`,
        rowCount: dataToInsert.length,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to insert data into database",
      });
    }
  } catch (error) {
    console.error("Error saving to database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to start a new scraping job with AI processing
router.post("/start-job", async (req, res) => {
  const { options, jobId } = req.body;

  if (!options || !options.url || !isValidUrl(options.url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  try {
    // Check if job already exists
    if (activeJobs.has(jobId)) {
      return res.status(400).json({ error: "Job already exists with this ID" });
    }

    // Create initial job state
    const job = {
      id: jobId,
      url: options.url,
      timestamp: new Date().toISOString(),
      status: "in-progress",
      progress: 10,
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

    activeJobs.set(jobId, job);

    // Start the scraping process
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Configure browser based on options
    if (
      options.securityOptions?.enableProxy &&
      options.securityOptions.proxyUrl
    ) {
      await page.authenticate({
        username: options.securityOptions.proxyUsername,
        password: options.securityOptions.proxyPassword,
      });
    }

    // Set user agent for stealth mode
    if (options.stealthMode) {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      );
    }

    // Navigate to URL
    await page.goto(options.url, {
      waitUntil: options.waitForDynamicContent
        ? "networkidle2"
        : "domcontentloaded",
      timeout: 30000,
    });

    // Wait for specific selector or time if configured
    if (options.selector) {
      await page.waitForSelector(options.selector, {
        timeout: options.waitTime || 5000,
      });
    } else if (options.waitTime) {
      await new Promise((resolve) => setTimeout(resolve, options.waitTime));
    }

    // Handle login if required
    if (options.loginRequired && options.loginCredentials) {
      const {
        username,
        password,
        usernameSelector,
        passwordSelector,
        submitSelector,
      } = options.loginCredentials;

      if (
        username &&
        password &&
        usernameSelector &&
        passwordSelector &&
        submitSelector
      ) {
        await page.type(usernameSelector, username);
        await page.type(passwordSelector, password);
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2" }),
          page.click(submitSelector),
        ]);
      }
    }

    // Update job progress
    job.progress = 30;
    activeJobs.set(jobId, job);

    // Extract page metadata
    job.metadata.pageTitle = await page.title();
    job.metadata.pageDescription = await page
      .$eval('meta[name="description"]', (element) => element.content)
      .catch(() => "");

    job.metadata.pageKeywords = await page
      .$eval('meta[name="keywords"]', (element) => element.content.split(","))
      .catch(() => []);

    // Extract content based on options
    const content = await page.content();
    const $ = cheerio.load(content);

    // Remove headers and footers if requested
    if (options.skipHeadersFooters) {
      $("header, footer, nav").remove();
    }

    // Remove media if requested
    if (options.skipMedia) {
      $("img, video, audio, iframe").remove();
    }

    // Extract text content
    if (options.scrapeText !== false) {
      $("p, h1, h2, h3, h4, h5, h6, span, div").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          job.data.text.push(text);
        }
      });
    }

    // Extract images
    if (options.scrapeImages) {
      $("img").each((i, el) => {
        const src = $(el).attr("src");
        if (src && !src.startsWith("data:")) {
          job.data.images.push(src);
        }
      });
    }

    // Extract videos
    if (options.scrapeVideos) {
      $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').each((i, el) => {
        const src = $(el).attr("src");
        if (src) {
          job.data.videos.push(src);
        }
      });
    }

    // Extract tables
    $("table").each((i, el) => {
      const table = [];
      $(el)
        .find("tr")
        .each((rowIndex, row) => {
          const rowData = [];
          $(row)
            .find("th, td")
            .each((cellIndex, cell) => {
              rowData.push($(cell).text().trim());
            });
          if (rowData.length > 0) {
            table.push(rowData);
          }
        });
      if (table.length > 0) {
        job.data.tables.push(table);
      }
    });

    // Extract lists
    $("ul, ol").each((i, el) => {
      const list = [];
      $(el)
        .find("li")
        .each((itemIndex, item) => {
          const text = $(item).text().trim();
          if (text) {
            list.push(text);
          }
        });
      if (list.length > 0) {
        job.data.lists.push(list);
      }
    });

    // Handle pagination if enabled
    if (options.pagination?.enabled && options.pagination.nextButtonSelector) {
      let currentPage = 1;
      const maxPages = options.pagination.maxPages || 5;

      while (currentPage < maxPages) {
        const hasNextPage = await page.$(options.pagination.nextButtonSelector);
        if (!hasNextPage) break;

        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2" }),
          page.click(options.pagination.nextButtonSelector),
        ]);

        // Extract content from the new page
        const pageContent = await page.content();
        const $page = cheerio.load(pageContent);

        // Extract text from the new page
        if (options.scrapeText !== false) {
          $page("p, h1, h2, h3, h4, h5, h6, span, div").each((i, el) => {
            const text = $page(el).text().trim();
            if (text && text.length > 10) {
              job.data.text.push(text);
            }
          });
        }

        currentPage++;

        // Add delay between pagination requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update job progress
    job.progress = 50;
    job.metadata.totalElements =
      job.data.text.length +
      job.data.images.length +
      job.data.videos.length +
      job.data.tables.length +
      job.data.lists.length;
    activeJobs.set(jobId, job);

    await browser.close();

    res.json({
      success: true,
      jobId,
      progress: job.progress,
      metadata: job.metadata,
    });
  } catch (error) {
    console.error("Error starting scraping job:", error);

    // Update job status if it exists
    if (activeJobs.has(jobId)) {
      const job = activeJobs.get(jobId);
      job.status = "failed";
      job.error = error.message;
      activeJobs.set(jobId, job);
    }

    res.status(500).json({ error: error.message });
  }
});

// Route to run AI analysis on scraped content
router.post("/analyze", async (req, res) => {
  const { resultId, options } = req.body;

  if (!resultId || !activeJobs.has(resultId)) {
    return res.status(400).json({ error: "Invalid or missing result ID" });
  }

  try {
    const job = activeJobs.get(resultId);

    // Simulate AI processing (in a real implementation, this would call an AI service)
    job.progress = 70;
    activeJobs.set(resultId, job);

    // Create a basic AI analysis result
    const aiAnalysis = {
      sentiment: options?.performSentimentAnalysis
        ? {
            overall: Math.random() > 0.5 ? "positive" : "negative",
            score: Math.random(),
          }
        : undefined,
      entities: options?.extractEntities
        ? [
            { name: "Example Entity", type: "organization", count: 3 },
            { name: "John Doe", type: "person", count: 2 },
          ]
        : undefined,
      summary: options?.generateSummary
        ? "This is an AI-generated summary of the content. In a real implementation, this would be generated by an AI service based on the scraped content."
        : undefined,
      keywords: options?.extractKeywords
        ? ["example", "keyword", "extraction", "ai", "analysis"]
        : undefined,
      categories: options?.categorizeContent
        ? ["Technology", "Web Development"]
        : undefined,
      structuredData: options?.extractStructuredData
        ? {
            title: job.metadata.pageTitle,
            description: job.metadata.pageDescription,
            mainContent: job.data.text.slice(0, 3).join(" "),
            contentSections: [
              { title: "Section 1", content: "Example content for section 1" },
              { title: "Section 2", content: "Example content for section 2" },
            ],
          }
        : undefined,
      cleanedText: options?.cleaningLevel
        ? job.data.text.join("\n\n").substring(0, 1000) + "..."
        : undefined,
    };

    // Update job with AI analysis
    job.aiAnalysis = aiAnalysis;
    job.progress = 90;
    activeJobs.set(resultId, job);

    res.json({
      success: true,
      jobId: resultId,
      progress: job.progress,
      aiAnalysis,
    });
  } catch (error) {
    console.error("Error running AI analysis:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get job status
router.get("/job/:jobId", (req, res) => {
  const { jobId } = req.params;

  if (!jobId || !activeJobs.has(jobId)) {
    return res.status(404).json({ error: "Job not found" });
  }

  const job = activeJobs.get(jobId);
  res.json(job);
});

// Route to upload a file with URLs
router.post("/upload-urls", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");
    let urls = [];

    // Process based on file type
    if (req.file.originalname.endsWith(".json")) {
      // Parse JSON file
      const jsonData = JSON.parse(fileContent);

      // Extract URLs from JSON structure
      const extractUrls = (data) => {
        if (typeof data === "string" && data.match(/^https?:\/\//)) {
          urls.push(data);
        } else if (Array.isArray(data)) {
          data.forEach((item) => extractUrls(item));
        } else if (typeof data === "object" && data !== null) {
          Object.values(data).forEach((value) => extractUrls(value));
        }
      };

      extractUrls(jsonData);
    } else if (req.file.originalname.endsWith(".csv")) {
      // Parse CSV file (assuming URLs are in the first column)
      const lines = fileContent.split(/\r?\n/);
      urls = lines
        .map((line) => {
          const columns = line.split(",");
          return columns[0].trim().replace(/["']/g, "");
        })
        .filter((url) => url && url.match(/^https?:\/\//));
    } else {
      // Treat as plain text file with one URL per line
      urls = fileContent
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter((url) => url && url.match(/^https?:\/\//));
    }

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Validate URLs
    const validUrls = [];
    const invalidUrls = [];

    urls.forEach((url) => {
      if (isValidUrl(url)) {
        validUrls.push(url);
      } else {
        invalidUrls.push(url);
      }
    });

    res.json({
      success: true,
      validUrls,
      invalidUrls,
      totalValid: validUrls.length,
      totalInvalid: invalidUrls.length,
    });
  } catch (error) {
    console.error("Error processing uploaded file:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
