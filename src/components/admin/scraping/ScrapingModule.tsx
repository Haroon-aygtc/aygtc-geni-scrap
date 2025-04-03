import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Play,
  Download,
  Database,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import WebPreview from "./WebPreview";
import URLManager from "./URLManager";
import DatabaseConfigPanel from "./DatabaseConfigPanel";
import {
  SelectorConfig,
  ScrapingResult,
  DatabaseConfig,
  scrapeMultipleUrls,
  saveToDatabase,
} from "@/services/scrapingService";
import axios from "axios";

const ScrapingModule: React.FC = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<string[]>(["https://example.com"]);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [selectors, setSelectors] = useState<SelectorConfig[]>([]);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("urls");
  const [outputFolder, setOutputFolder] = useState("data/scraping");
  const [dbConfig, setDbConfig] = useState<DatabaseConfig | null>(null);

  // Set active URL for preview
  const previewUrl = (url: string) => {
    if (url) {
      setActiveUrl(url);
      setActiveTab("preview");
    }
  };

  // Add selector
  const addSelector = (selector: SelectorConfig) => {
    setSelectors([...selectors, selector]);
    toast({
      title: "Selector Added",
      description: `Added selector "${selector.name}" to the configuration.`,
    });
  };

  // Remove selector
  const removeSelector = (id: string) => {
    setSelectors(selectors.filter((s) => s.id !== id));
  };

  // Start scraping
  const startScraping = async () => {
    // Validate inputs
    const validUrls = urls.filter((url) => url.trim() !== "");
    if (validUrls.length === 0) {
      toast({
        title: "No URLs",
        description: "Please enter at least one URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    if (selectors.length === 0) {
      toast({
        title: "No Selectors",
        description: "Please add at least one selector to extract data.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setResults([]);

      // Prepare scraping targets
      const targets = validUrls.map((url) => ({
        url,
        selectors,
      }));

      // Call the API to scrape the URLs
      const response = await axios.post("/api/scraping/scrape", { targets });
      const scrapingResults = response.data;
      setResults(scrapingResults);

      // Show success message
      const successCount = scrapingResults.filter(
        (r: ScrapingResult) => r.success,
      ).length;
      const failCount = scrapingResults.length - successCount;

      toast({
        title: "Scraping Complete",
        description: `Successfully scraped ${successCount} URLs${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      // Switch to results tab
      setActiveTab("results");
    } catch (error) {
      console.error("Scraping error:", error);
      toast({
        title: "Scraping Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while scraping.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save results to file
  const saveResultsToFile = async () => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "There are no results to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to save the results to a file
      const response = await axios.post("/api/scraping/save-file", {
        results,
        filename: `scraping_results_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
      });

      toast({
        title: "Results Saved",
        description: `Results saved to ${response.data.filePath}`,
      });
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Save Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while saving results.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save results to database
  const saveResultsToDatabase = async () => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "There are no results to save.",
        variant: "destructive",
      });
      return;
    }

    if (!dbConfig) {
      toast({
        title: "No Database Configuration",
        description: "Please configure database settings first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to save the results to the database
      const response = await axios.post("/api/scraping/save-db", {
        results,
        dbConfig,
      });

      toast({
        title: "Results Saved to Database",
        description: `Successfully saved results to table ${dbConfig.table}.`,
      });
    } catch (error) {
      console.error("Error saving to database:", error);
      toast({
        title: "Database Save Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while saving to database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle database config save
  const handleDbConfigSave = (config: DatabaseConfig) => {
    setDbConfig(config);
    toast({
      title: "Database Configuration Saved",
      description: `Configured to save data to table ${config.table}.`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Web Scraping Module</CardTitle>
          <CardDescription>
            Extract structured data from websites with real-time visualization
            and selection tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="urls">URLs</TabsTrigger>
              <TabsTrigger value="preview">Preview & Select</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="storage">Storage Options</TabsTrigger>
            </TabsList>

            {/* URLs Tab */}
            <TabsContent value="urls" className="space-y-4">
              <URLManager
                urls={urls}
                onUrlsChange={setUrls}
                onPreviewUrl={previewUrl}
              />

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">
                  Configured Selectors
                </h3>
                {selectors.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No selectors configured. Go to the Preview tab to add
                    selectors.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectors.map((selector) => (
                      <div
                        key={selector.id}
                        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md"
                      >
                        <div>
                          <span className="font-medium">{selector.name}</span>
                          <span className="text-xs text-gray-500 block">
                            {selector.selector}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSelector(selector.id)}
                        >
                          <AlertCircle size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={startScraping}
                  disabled={
                    isLoading ||
                    urls.filter((u) => u).length === 0 ||
                    selectors.length === 0
                  }
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} />
                  )}
                  {isLoading ? "Scraping..." : "Start Scraping"}
                </Button>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              {activeUrl ? (
                <WebPreview url={activeUrl} onSelectorCreated={addSelector} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-md">
                  <AlertCircle size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Please select a URL to preview
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("urls")}
                  >
                    Go to URLs Tab
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results">
              {results.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Scraping Results</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={saveResultsToFile}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        Save to File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={saveResultsToDatabase}
                        disabled={isLoading || !dbConfig}
                        className="flex items-center gap-2"
                      >
                        <Database size={16} />
                        Save to Database
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Card key={index}>
                        <CardHeader
                          className={`pb-2 ${result.success ? "" : "bg-red-50"}`}
                        >
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="truncate">{result.url}</span>
                            {!result.success && (
                              <span className="text-red-500 text-sm font-normal">
                                Failed
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {result.success ? (
                            <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-sm max-h-60">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          ) : (
                            <div className="text-red-500 text-sm">
                              {result.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-md">
                  <AlertCircle size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">No scraping results yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={startScraping}
                    disabled={
                      isLoading ||
                      urls.filter((u) => u).length === 0 ||
                      selectors.length === 0
                    }
                  >
                    Start Scraping
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Storage Options Tab */}
            <TabsContent value="storage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save size={18} />
                    File Storage
                  </CardTitle>
                  <CardDescription>
                    Configure where to save the scraped data as JSON files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="output-folder">Output Folder</Label>
                    <Input
                      id="output-folder"
                      value={outputFolder}
                      onChange={(e) => setOutputFolder(e.target.value)}
                      placeholder="data/scraping"
                    />
                    <p className="text-xs text-gray-500">
                      Relative to the project root directory
                    </p>
                  </div>
                </CardContent>
              </Card>

              <DatabaseConfigPanel
                selectors={selectors}
                onSaveConfig={handleDbConfigSave}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingModule;
