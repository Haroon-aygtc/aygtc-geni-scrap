import React, { useState, useEffect } from "react";
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
  Plus,
  Settings,
  Eye,
  Code,
  FileJson,
  Table2,
  Trash,
  Copy,
  Check,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import WebPreview from "./WebPreview";
import URLManager from "./URLManager";
import DatabaseConfigPanel from "./DatabaseConfigPanel";
import {
  SelectorConfig,
  ScrapingResult,
  DatabaseConfig,
  scrapeMultipleUrls,
  saveToDatabase,
  saveToFile,
} from "@/services/scrapingService";
import { v4 as uuidv4 } from "uuid";
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
  const [selectedSelector, setSelectedSelector] =
    useState<SelectorConfig | null>(null);
  const [isEditingSelector, setIsEditingSelector] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [requestHeaders, setRequestHeaders] = useState(
    '{\n  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"\n}',
  );
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [exportFormat, setExportFormat] = useState("json");
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState("visual"); // visual or code
  const [previewHeight, setPreviewHeight] = useState(600);
  const [previewWidth, setPreviewWidth] = useState(1024);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [waitForSelector, setWaitForSelector] = useState("");
  const [waitTimeout, setWaitTimeout] = useState(5000);
  const [enableJavaScript, setEnableJavaScript] = useState(true);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [maxDepth, setMaxDepth] = useState(1);
  const [throttleRequests, setThrottleRequests] = useState(true);
  const [throttleDelay, setThrottleDelay] = useState(1000);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState("");
  const [cookiesEnabled, setCookiesEnabled] = useState(false);
  const [cookies, setCookies] = useState("");
  const [captureScreenshot, setCaptureScreenshot] = useState(false);

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

  // Create a new selector
  const createNewSelector = () => {
    const newSelector: SelectorConfig = {
      id: uuidv4(),
      name: `Selector ${selectors.length + 1}`,
      selector: "",
      type: "text",
    };
    setSelectedSelector(newSelector);
    setIsEditingSelector(false);
  };

  // Edit selector
  const editSelector = (selector: SelectorConfig) => {
    setSelectedSelector({ ...selector });
    setIsEditingSelector(true);
  };

  // Save selector
  const saveSelector = () => {
    if (!selectedSelector) return;

    if (!selectedSelector.name || !selectedSelector.selector) {
      toast({
        title: "Validation Error",
        description: "Selector name and CSS selector are required.",
        variant: "destructive",
      });
      return;
    }

    if (isEditingSelector) {
      // Update existing selector
      setSelectors(
        selectors.map((s) =>
          s.id === selectedSelector.id ? selectedSelector : s,
        ),
      );
      toast({
        title: "Selector Updated",
        description: `Updated selector "${selectedSelector.name}".`,
      });
    } else {
      // Add new selector
      setSelectors([...selectors, selectedSelector]);
      toast({
        title: "Selector Added",
        description: `Added selector "${selectedSelector.name}" to the configuration.`,
      });
    }

    setSelectedSelector(null);
  };

  // Cancel selector editing
  const cancelSelectorEdit = () => {
    setSelectedSelector(null);
  };

  // Remove selector
  const removeSelector = (id: string) => {
    setSelectors(selectors.filter((s) => s.id !== id));
    toast({
      title: "Selector Removed",
      description: "Selector has been removed from the configuration.",
    });
  };

  // Copy selector to clipboard
  const copySelector = (selector: string) => {
    navigator.clipboard.writeText(selector);
    setCopiedSelector(selector);
    setTimeout(() => setCopiedSelector(null), 2000);
    toast({
      title: "Copied to Clipboard",
      description: "Selector has been copied to clipboard.",
    });
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

      // Parse request headers if provided
      let headers = {};
      try {
        if (requestHeaders.trim()) {
          headers = JSON.parse(requestHeaders);
        }
      } catch (err) {
        toast({
          title: "Invalid Headers",
          description: "Please provide valid JSON for request headers.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Parse request body if provided and method is not GET
      let body = null;
      if (requestMethod !== "GET" && requestBody.trim()) {
        try {
          body = JSON.parse(requestBody);
        } catch (err) {
          toast({
            title: "Invalid Request Body",
            description: "Please provide valid JSON for request body.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Prepare scraping targets
      const targets = validUrls.map((url) => ({
        url,
        selectors,
        options: {
          headers,
          method: requestMethod,
          body,
          waitForSelector: waitForSelector || undefined,
          waitTimeout: waitTimeout,
          enableJavaScript,
          followRedirects,
          maxDepth,
          throttle: throttleRequests ? throttleDelay : 0,
          proxy: proxyEnabled ? proxyUrl : undefined,
          cookies: cookiesEnabled ? cookies : undefined,
          captureScreenshot,
          device: previewDevice,
          viewport: {
            width: previewWidth,
            height: previewHeight,
          },
        },
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
        filename: `scraping_results_${new Date().toISOString().replace(/[:.]/g, "-")}.${exportFormat}`,
        format: exportFormat,
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
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="urls">URLs</TabsTrigger>
              <TabsTrigger value="selectors">Selectors</TabsTrigger>
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

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings size={18} />
                    Advanced Request Options
                  </CardTitle>
                  <CardDescription>
                    Configure how requests are made to the target websites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="request-options">
                      <AccordionTrigger>Request Configuration</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="request-method">
                                Request Method
                              </Label>
                              <Select
                                value={requestMethod}
                                onValueChange={setRequestMethod}
                              >
                                <SelectTrigger id="request-method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="follow-redirects">
                                Follow Redirects
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="follow-redirects"
                                  checked={followRedirects}
                                  onCheckedChange={setFollowRedirects}
                                />
                                <Label htmlFor="follow-redirects">
                                  {followRedirects ? "Enabled" : "Disabled"}
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="request-headers">
                              Request Headers (JSON)
                            </Label>
                            <Textarea
                              id="request-headers"
                              value={requestHeaders}
                              onChange={(e) =>
                                setRequestHeaders(e.target.value)
                              }
                              placeholder='{"User-Agent": "Mozilla/5.0", "Accept": "text/html"}'
                              className="font-mono text-sm"
                              rows={5}
                            />
                          </div>

                          {requestMethod !== "GET" && (
                            <div className="space-y-2">
                              <Label htmlFor="request-body">
                                Request Body (JSON)
                              </Label>
                              <Textarea
                                id="request-body"
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                                placeholder='{"key": "value"}'
                                className="font-mono text-sm"
                                rows={5}
                              />
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="browser-options">
                      <AccordionTrigger>Browser Behavior</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="enable-javascript">
                                JavaScript
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="enable-javascript"
                                  checked={enableJavaScript}
                                  onCheckedChange={setEnableJavaScript}
                                />
                                <Label htmlFor="enable-javascript">
                                  {enableJavaScript ? "Enabled" : "Disabled"}
                                </Label>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="capture-screenshot">
                                Capture Screenshot
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="capture-screenshot"
                                  checked={captureScreenshot}
                                  onCheckedChange={setCaptureScreenshot}
                                />
                                <Label htmlFor="capture-screenshot">
                                  {captureScreenshot ? "Enabled" : "Disabled"}
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="preview-device">
                                Device Emulation
                              </Label>
                              <Select
                                value={previewDevice}
                                onValueChange={setPreviewDevice}
                              >
                                <SelectTrigger id="preview-device">
                                  <SelectValue placeholder="Select device" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="desktop">
                                    Desktop
                                  </SelectItem>
                                  <SelectItem value="mobile">Mobile</SelectItem>
                                  <SelectItem value="tablet">Tablet</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="preview-width">
                                Viewport Width
                              </Label>
                              <Input
                                id="preview-width"
                                type="number"
                                value={previewWidth}
                                onChange={(e) =>
                                  setPreviewWidth(
                                    parseInt(e.target.value) || 1024,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="preview-height">
                                Viewport Height
                              </Label>
                              <Input
                                id="preview-height"
                                type="number"
                                value={previewHeight}
                                onChange={(e) =>
                                  setPreviewHeight(
                                    parseInt(e.target.value) || 600,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wait-for-selector">
                                Wait For Selector
                              </Label>
                              <Input
                                id="wait-for-selector"
                                value={waitForSelector}
                                onChange={(e) =>
                                  setWaitForSelector(e.target.value)
                                }
                                placeholder=".content, #main, etc."
                              />
                              <p className="text-xs text-muted-foreground">
                                Wait for this selector to appear before scraping
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="wait-timeout">
                                Wait Timeout (ms)
                              </Label>
                              <Input
                                id="wait-timeout"
                                type="number"
                                value={waitTimeout}
                                onChange={(e) =>
                                  setWaitTimeout(
                                    parseInt(e.target.value) || 5000,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="advanced-options">
                      <AccordionTrigger>Advanced Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="max-depth">Max Crawl Depth</Label>
                              <Input
                                id="max-depth"
                                type="number"
                                value={maxDepth}
                                onChange={(e) =>
                                  setMaxDepth(parseInt(e.target.value) || 1)
                                }
                                min="1"
                                max="10"
                              />
                              <p className="text-xs text-muted-foreground">
                                Maximum depth for crawling linked pages
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="throttle-requests">
                                Throttle Requests
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="throttle-requests"
                                  checked={throttleRequests}
                                  onCheckedChange={setThrottleRequests}
                                />
                                <Label htmlFor="throttle-requests">
                                  {throttleRequests ? "Enabled" : "Disabled"}
                                </Label>
                              </div>
                              {throttleRequests && (
                                <Input
                                  id="throttle-delay"
                                  type="number"
                                  value={throttleDelay}
                                  onChange={(e) =>
                                    setThrottleDelay(
                                      parseInt(e.target.value) || 1000,
                                    )
                                  }
                                  placeholder="Delay in milliseconds"
                                  className="mt-2"
                                />
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="proxy-enabled">Use Proxy</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="proxy-enabled"
                                checked={proxyEnabled}
                                onCheckedChange={setProxyEnabled}
                              />
                              <Label htmlFor="proxy-enabled">
                                {proxyEnabled ? "Enabled" : "Disabled"}
                              </Label>
                            </div>
                            {proxyEnabled && (
                              <Input
                                id="proxy-url"
                                value={proxyUrl}
                                onChange={(e) => setProxyUrl(e.target.value)}
                                placeholder="http://username:password@proxy.example.com:8080"
                                className="mt-2"
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cookies-enabled">
                              Custom Cookies
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="cookies-enabled"
                                checked={cookiesEnabled}
                                onCheckedChange={setCookiesEnabled}
                              />
                              <Label htmlFor="cookies-enabled">
                                {cookiesEnabled ? "Enabled" : "Disabled"}
                              </Label>
                            </div>
                            {cookiesEnabled && (
                              <Textarea
                                id="cookies"
                                value={cookies}
                                onChange={(e) => setCookies(e.target.value)}
                                placeholder="name=value; domain=example.com; path=/"
                                className="mt-2"
                                rows={3}
                              />
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

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

            {/* Selectors Tab */}
            <TabsContent value="selectors" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Configured Selectors</h3>
                <Button
                  onClick={createNewSelector}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Selector
                </Button>
              </div>

              {selectors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-md">
                  <AlertCircle size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    No selectors configured. Click "Add Selector" to create one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectors.map((selector) => (
                    <Card key={selector.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{selector.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{selector.type}</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                  {selector.selector}
                                </code>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          copySelector(selector.selector)
                                        }
                                      >
                                        {copiedSelector ===
                                        selector.selector ? (
                                          <Check
                                            size={12}
                                            className="text-green-500"
                                          />
                                        ) : (
                                          <Copy size={12} />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy selector</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            {selector.attribute && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Attribute: {selector.attribute}
                              </p>
                            )}
                            {selector.listItemSelector && (
                              <p className="text-xs text-muted-foreground mt-1">
                                List item: {selector.listItemSelector}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editSelector(selector)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeSelector(selector.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Selector Edit Dialog */}
              {selectedSelector && (
                <Dialog
                  open={!!selectedSelector}
                  onOpenChange={(open) => !open && setSelectedSelector(null)}
                >
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isEditingSelector ? "Edit Selector" : "Add Selector"}
                      </DialogTitle>
                      <DialogDescription>
                        Configure the selector to extract specific data from the
                        webpage.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="selector-name">Name</Label>
                        <Input
                          id="selector-name"
                          value={selectedSelector.name}
                          onChange={(e) =>
                            setSelectedSelector({
                              ...selectedSelector,
                              name: e.target.value,
                            })
                          }
                          placeholder="Product Title, Price, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="selector-css">CSS Selector</Label>
                        <Input
                          id="selector-css"
                          value={selectedSelector.selector}
                          onChange={(e) =>
                            setSelectedSelector({
                              ...selectedSelector,
                              selector: e.target.value,
                            })
                          }
                          placeholder=".product-title, #price, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="selector-type">Type</Label>
                        <Select
                          value={selectedSelector.type}
                          onValueChange={(value) =>
                            setSelectedSelector({
                              ...selectedSelector,
                              type: value as
                                | "text"
                                | "html"
                                | "attribute"
                                | "list",
                            })
                          }
                        >
                          <SelectTrigger id="selector-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="attribute">Attribute</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSelector.type === "attribute" && (
                        <div className="space-y-2">
                          <Label htmlFor="selector-attribute">
                            Attribute Name
                          </Label>
                          <Input
                            id="selector-attribute"
                            value={selectedSelector.attribute || ""}
                            onChange={(e) =>
                              setSelectedSelector({
                                ...selectedSelector,
                                attribute: e.target.value,
                              })
                            }
                            placeholder="href, src, data-id, etc."
                          />
                        </div>
                      )}

                      {selectedSelector.type === "list" && (
                        <div className="space-y-2">
                          <Label htmlFor="selector-list-item">
                            List Item Selector
                          </Label>
                          <Input
                            id="selector-list-item"
                            value={selectedSelector.listItemSelector || ""}
                            onChange={(e) =>
                              setSelectedSelector({
                                ...selectedSelector,
                                listItemSelector: e.target.value,
                              })
                            }
                            placeholder="li, .item, etc."
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={cancelSelectorEdit}>
                        Cancel
                      </Button>
                      <Button onClick={saveSelector}>
                        {isEditingSelector ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              {activeUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Preview: {activeUrl}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          previewMode === "visual" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPreviewMode("visual")}
                      >
                        <Eye size={16} className="mr-2" />
                        Visual
                      </Button>
                      <Button
                        variant={previewMode === "code" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode("code")}
                      >
                        <Code size={16} className="mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>
                  <WebPreview
                    url={activeUrl}
                    onSelectorCreated={addSelector}
                    mode={previewMode === "visual" ? "visual" : "code"}
                  />
                </div>
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
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
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
                            <div className="space-y-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      JSON.stringify(result.data, null, 2),
                                    );
                                    toast({
                                      title: "Copied to Clipboard",
                                      description:
                                        "Result data has been copied to clipboard.",
                                    });
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Copy size={14} />
                                  Copy
                                </Button>
                              </div>
                              <Tabs defaultValue="json">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger
                                    value="json"
                                    className="flex items-center gap-1"
                                  >
                                    <FileJson size={14} />
                                    JSON
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="table"
                                    className="flex items-center gap-1"
                                  >
                                    <Table2 size={14} />
                                    Table
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="raw"
                                    className="flex items-center gap-1"
                                  >
                                    <Code size={14} />
                                    Raw
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="json">
                                  <ScrollArea className="h-[300px] rounded-md border p-4">
                                    <pre className="text-sm font-mono">
                                      {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </TabsContent>
                                <TabsContent value="table">
                                  <ScrollArea className="h-[300px] rounded-md border">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b bg-muted/50">
                                          <th className="p-2 text-left font-medium">
                                            Field
                                          </th>
                                          <th className="p-2 text-left font-medium">
                                            Value
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(result.data).map(
                                          ([key, value]) => (
                                            <tr key={key} className="border-b">
                                              <td className="p-2 font-mono text-sm">
                                                {key}
                                              </td>
                                              <td className="p-2 text-sm">
                                                {typeof value === "object" ? (
                                                  <pre className="text-xs">
                                                    {JSON.stringify(
                                                      value,
                                                      null,
                                                      2,
                                                    )}
                                                  </pre>
                                                ) : (
                                                  String(value)
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </ScrollArea>
                                </TabsContent>
                                <TabsContent value="raw">
                                  <ScrollArea className="h-[300px] rounded-md border p-4">
                                    <pre className="text-sm">
                                      {JSON.stringify(result)}
                                    </pre>
                                  </ScrollArea>
                                </TabsContent>
                              </Tabs>
                            </div>
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
                    Configure where to save the scraped data as files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="output-folder">Output Folder</Label>
                      <Input
                        id="output-folder"
                        value={outputFolder}
                        onChange={(e) => setOutputFolder(e.target.value)}
                        placeholder="data/scraping"
                      />
                      <p className="text-xs text-muted-foreground">
                        Relative to the project root directory
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-format">
                        Default Export Format
                      </Label>
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger id="export-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
