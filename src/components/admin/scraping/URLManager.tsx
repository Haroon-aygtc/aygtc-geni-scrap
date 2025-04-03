import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

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
  // Add URL input field
  const addUrlField = () => {
    onUrlsChange([...urls, ""]);
  };

  // Remove URL input field
  const removeUrlField = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    onUrlsChange(newUrls);
  };

  // Update URL value
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    onUrlsChange(newUrls);
  };

  return (
    <div className="space-y-4">
      {urls.map((url, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={url}
            onChange={(e) => updateUrl(index, e.target.value)}
            placeholder="https://example.com"
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => onPreviewUrl(url)}
            disabled={!url}
          >
            Preview
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeUrlField(index)}
            disabled={urls.length === 1}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}

      <Button
        onClick={addUrlField}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus size={16} />
        Add URL
      </Button>
    </div>
  );
};

export default URLManager;
