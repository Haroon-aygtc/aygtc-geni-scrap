import React, { useState, useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import WebPreview from "./WebPreview";
import URLManager from "./URLManager";
import DatabaseConfigPanel from "./DatabaseConfigPanel";
import SelectorTool from "./SelectorTool";
import {
  SelectorConfig,
  ScrapingResult,
  DatabaseConfig,
} from "@/services/scrapingService";
import scrapingService from "@/services/scrapingService";

interface Project {
  id: string;
  name: string;
  urls: string[];
  selectors: SelectorConfig[];
  databaseConfig?: DatabaseConfig;
  lastRun?: string;
  results?: ScrapingResult[];
}

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
  const [showSelectorTool, setShowSelectorTool] = useState(false);
  const [selectorToolPosition, setSelectorToolPosition] = useState({ x: 100, y: 100 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("New Scraping Project");
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [selectedSelectorForTest, setSelectedSelectorForTest] = useState<string | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("scraping-projects");
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        
        // If there's at least one project, set it as current
        if (parsedProjects.length > 0) {
          const lastProject = parsedProjects[parsedProjects.length - 1];
          setCurrentProject(lastProject);
          setUrls(lastProject.urls || []);
          setSelectors(lastProject.selectors || []);
          setProjectName(lastProject.name);
          if (lastProject.databaseConfig) {
            setDbConfig(lastProject.databaseConfig);
          }
          if (lastProject.results) {
            setResults(lastProject.results);
          }
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    }
  }, []);

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
    if (!activeUrl) {
      toast({
        title: "No URL Selected",
        description: "Please preview a URL before adding selectors",
        variant: "destructive"
      });
      return;
    }
    setShowSelectorTool(true);
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

  // Test selector against current URL
  const testSelector = async (selectorId: string) => {
    if (!activeUrl) {
      toast({
        title: "No URL Selected",
        description: "Please preview a URL before testing selectors",
        variant: "destructive"
      });
      return;
    }
    
    const selector = selectors.find(s => s.id === selectorId);
    if (!selector) return;
    
    setSelectedSelectorForTest(selectorId);
    
    try {
      const result = await scrapingService.testSelector(activeUrl, selector);
      setTestResults({
        ...testResults,
        [selectorId]: result
      });
      
      toast({
        title: result.success ? "Test Successful" : "Test Failed",
        description: result.success 
          ? "Selector successfully extracted data" 
          : `Test failed: ${result.error || "Unknown error"}`,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test selector. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSelectedSelectorForTest(null);
    }
  };

  // Save current project
  const saveCurrentProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a name for your project",
        variant: "destructive"
      });
      return;
    }

    const projectToSave: Project = {
      id: currentProject?.id || `project_${Date.now()}`,
      name: projectName,
      urls,
      selectors,
      databaseConfig: dbConfig || undefined,
      lastRun: currentProject?.lastRun,
      results: results.length > 0 ? results : currentProject?.results
    };

    let updatedProjects: Project[];
    
    if (currentProject && projects.some(p => p.id === projectToSave.id)) {
      // Update existing project
      updatedProjects = projects.map(p => 
        p.id === projectToSave.id ? projectToSave : p
      );
    } else {
      // Create new project
      updatedProjects = [...projects, projectToSave];
    }

    setProjects(updatedProjects);
    setCurrentProject(projectToSave);
    localStorage.setItem("scraping-projects", JSON.stringify(updatedProjects));
    
    toast({
      title: "Project Saved",
      description: `Project "${projectName}" has been saved successfully`
    });
  };

  // Create new project
  const createNewProject = () => {
    setCurrentProject(null);
    setUrls(["https://example.com"]);
    setSelectors([]);
    setProjectName("New Scraping Project");
    setDbConfig(null);
    setResults([]);
    setActiveTab("urls");
    setActiveUrl("");
  };

  // Load existing project
  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setUrls(project.urls || []);
    setSelectors(project.selectors || []);
    setProjectName(project.name);
    setDbConfig(project.databaseConfig || null);
    setResults(project.results || []);
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("scraping-projects", JSON.stringify(updatedProjects));
    
    if (currentProject?.id === projectId) {
      if (updatedProjects.length > 0) {
        loadProject(updatedProjects[0]);
      } else {
        createNewProject();
      }
    }
    
    toast({
      title: "Project Deleted",
      description: "The project has been deleted successfully"
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
      setScrapingProgress(0);

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

      // Set up progress updates
      const progressInterval = setInterval(() => {
        setScrapingProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);

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
      const scrapingResults = await scrapingService.scrapeMultipleUrls(targets);
      clearInterval(progressInterval);
      setScrapingProgress(100);
      setResults(scrapingResults);

      // Update current project with results
      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          lastRun: new Date().toISOString(),
          results: scrapingResults
        };
        
        setCurrentProject(updatedProject);
        
        // Update projects list
        const updatedProjects = projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        );
        
        setProjects(updatedProjects);
        localStorage.setItem("scraping-projects", JSON.stringify(updatedProjects));
      }

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

      // Generate filename
      const filename = `scraping_results_${new Date().toISOString().replace(/[:.]/g, "-")}`;
      
      // Call the API to save the results to a file
      const filePath = await scrapingService.saveToFile(results, filename, exportFormat as any);

      toast({
        title: "Results Saved",
        description: `Results saved to ${filePath}`,
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
      await scrapingService.saveToDatabase(results, dbConfig);

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary focus:ring-0 px-1 py-0.5 w-full"
                  placeholder="Project Name"
                />
              </CardTitle>
              <CardDescription>
                Extract structured data from websites with real-time visualization
                and selection tools
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={createNewProject} size="sm">
                New Project
              </Button>
              <Button variant="outline" onClick={saveCurrentProject} size="sm">
                <Save size={16} className="mr-1" />
                Save Project
              </Button>
              <Button 
                variant="default" 
                onClick={startScraping} 
                size="sm"
                disabled={isLoading || urls.filter(u => u.trim()).length === 0 || selectors.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-1 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-1" />
                    Start Scraping
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {currentProject?.lastRun && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Last run: {new Date(currentProject.lastRun).toLocaleString()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {urls.filter(u => u.trim()).length} URL{urls.filter(u => u.trim()).length !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectors.length} Selector{selectors.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        {isLoading && (
          <div className="px-6 pb-2">
            <Progress value={scrapingProgress} className="h-2" />
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Scraping in progress: {scrapingProgress}%
            </p>
          </div>
        )}
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-1 border rounded-md p-3 max-h-[300px] overflow-y-auto">
              <h3 className="font-medium mb-2">Projects</h3>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved projects</p>
              ) : (
                <ul className="space-y-1">
                  {projects.map(project => (
                    <li 
                      key={project.id} 
                      className={`flex items-center justify-between p-2 rounded-md text-sm cursor-pointer ${currentProject?.id === project.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                      onClick={() => loadProject(project)}
                    >
                      <span className="truncate">{project.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="md:col-span-3">
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
