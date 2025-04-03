import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, ArrowUp, ArrowDown, FileUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface URLManagerProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  onPreviewUrl: (url: string) => void;
}

const URLManager: React.FC<URLManagerProps> = ({
  urls,
  onUrlsChange,
  onPreviewUrl,
}) => {
  const { toast } = useToast();
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  // Add URL input field
  const addUrlField = () => {
    if (newUrl.trim()) {
      try {
        // Validate URL format
        new URL(newUrl);
        onUrlsChange([...urls, newUrl]);
        setNewUrl("");
        toast({
          title: "URL Added",
          description: `Added ${newUrl}`,
        });
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
          variant: "destructive",
        });
      }
    } else {
      onUrlsChange([...urls, ""]);
    }
  };

  // Handle key press in URL input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newUrl.trim()) {
      addUrlField();
    }
  };

  // Remove URL input field
  const removeUrlField = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    onUrlsChange(newUrls);
    toast({
      title: "URL Removed",
      description: urls[index] ? `Removed ${urls[index]}` : "Removed empty URL",
    });
  };

  // Update URL value
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    onUrlsChange(newUrls);
  };

  // Move URL up in the list
  const moveUrlUp = (index: number) => {
    if (index === 0) return;
    const newUrls = [...urls];
    [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
    onUrlsChange(newUrls);
  };

  // Move URL down in the list
  const moveUrlDown = (index: number) => {
    if (index === urls.length - 1) return;
    const newUrls = [...urls];
    [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
    onUrlsChange(newUrls);
  };

  // Handle bulk URL import
  const handleBulkImport = () => {
    if (!bulkUrls.trim()) {
      setShowBulkDialog(false);
      return;
    }

    const urlList = bulkUrls
      .split(/\n/)
      .map((url) => url.trim())
      .filter((url) => url !== "");

    if (urlList.length === 0) {
      setShowBulkDialog(false);
      return;
    }

    // Validate URLs
    const validUrls: string[] = [];
    const invalidUrls: string[] = [];

    urlList.forEach((url) => {
      try {
        new URL(url);
        validUrls.push(url);
      } catch (e) {
        invalidUrls.push(url);
      }
    });

    if (validUrls.length > 0) {
      onUrlsChange([...urls, ...validUrls]);
      toast({
        title: "URLs Imported",
        description: `Successfully imported ${validUrls.length} URLs${invalidUrls.length > 0 ? ` (${invalidUrls.length} invalid URLs skipped)` : ""}`,
      });
    }

    if (validUrls.length === 0 && invalidUrls.length > 0) {
      toast({
        title: "Import Failed",
        description: `All ${invalidUrls.length} URLs were invalid. Please ensure they include http:// or https://`,
        variant: "destructive",
      });
    }

    setBulkUrls("");
    setShowBulkDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="https://example.com"
          className="flex-1"
        />
        <Button
          variant="default"
          onClick={addUrlField}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          Add URL
        </Button>
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <FileUp size={16} />
              Bulk Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Import URLs</DialogTitle>
              <DialogDescription>
                Enter one URL per line. Each URL must include http:// or
                https://
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://example.com\nhttps://another-site.com"
              rows={10}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkImport}>Import URLs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          {urls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No URLs added yet. Add a URL to start scraping.
            </div>
          ) : (
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex-shrink-0 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveUrlUp(index)}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveUrlDown(index)}
                      disabled={index === urls.length - 1}
                      className="h-6 w-6"
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreviewUrl(url)}
                    className="flex-shrink-0"
                    title="Preview URL"
                    disabled={!url}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUrlField(index)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                    title="Remove URL"
                    disabled={urls.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default URLManager;
