import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Code, Database } from "lucide-react";

const ScrapingModule = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Web Scraping Studio</h1>
      <p className="text-muted-foreground mb-4">
        Configure and run web scraping operations to extract data from websites.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              URL Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="https://example.com" />
              <Button>Load URL</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Selector Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define selectors to extract specific data from web pages.
            </p>
            <Button variant="outline">Add Selector</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Export & Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Export and store your scraped data in various formats.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline">JSON</Button>
            <Button variant="outline">CSV</Button>
            <Button variant="outline">Database</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingModule;
