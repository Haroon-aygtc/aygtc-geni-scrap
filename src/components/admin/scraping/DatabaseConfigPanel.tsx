import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectorConfig, DatabaseConfig } from "@/services/scrapingService";
import { Loader2, Database, Save } from "lucide-react";
import axios from "axios";

interface DatabaseConfigPanelProps {
  selectors: SelectorConfig[];
  onSaveConfig: (config: DatabaseConfig) => void;
}

interface TableInfo {
  name: string;
  columns: string[];
}

const DatabaseConfigPanel: React.FC<DatabaseConfigPanelProps> = ({
  selectors,
  onSaveConfig,
}) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch database tables and columns
  useEffect(() => {
    const fetchTables = async () => {
      if (selectors.length === 0) return;

      try {
        setLoading(true);
        setError(null);

        // In production, this would call your API endpoint
        const response = await axios.get("/api/scraping/database/tables");
        setTables(response.data);
      } catch (err) {
        console.error("Error fetching database tables:", err);
        setError(
          "Failed to load database tables. Please check your database connection.",
        );

        // Fallback to mock data for development
        const mockTables: TableInfo[] = [
          {
            name: "scraped_data",
            columns: [
              "id",
              "url",
              "title",
              "description",
              "price",
              "image_url",
              "created_at",
            ],
          },
          {
            name: "products",
            columns: [
              "id",
              "name",
              "price",
              "description",
              "image_url",
              "category",
              "created_at",
            ],
          },
          {
            name: "categories",
            columns: ["id", "name", "slug", "parent_id", "created_at"],
          },
        ];
        setTables(mockTables);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectors]);

  // Initialize column mappings when table is selected
  useEffect(() => {
    if (selectedTable && tables.length > 0) {
      const table = tables.find((t) => t.name === selectedTable);
      if (table) {
        // Reset mappings
        const initialMappings: Record<string, string> = {};
        selectors.forEach((selector) => {
          // Try to find a matching column name
          const matchingColumn = table.columns.find(
            (col) =>
              col.toLowerCase() === selector.name.toLowerCase() ||
              col.toLowerCase().includes(selector.name.toLowerCase()),
          );

          initialMappings[selector.id] = matchingColumn || "";
        });

        setColumnMappings(initialMappings);
      }
    }
  }, [selectedTable, tables, selectors]);

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
  };

  // Handle column mapping change
  const handleColumnMappingChange = (
    selectorId: string,
    columnName: string,
  ) => {
    setColumnMappings((prev) => ({
      ...prev,
      [selectorId]: columnName,
    }));
  };

  // Save database configuration
  const handleSaveConfig = () => {
    if (!selectedTable) {
      setError("Please select a table");
      return;
    }

    // Filter out empty mappings
    const filteredMappings: Record<string, string> = {};
    Object.entries(columnMappings).forEach(([selectorId, columnName]) => {
      if (columnName) {
        filteredMappings[selectorId] = columnName;
      }
    });

    if (Object.keys(filteredMappings).length === 0) {
      setError("Please map at least one selector to a database column");
      return;
    }

    const config: DatabaseConfig = {
      table: selectedTable,
      columns: filteredMappings,
    };

    onSaveConfig(config);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
          <CardDescription>Loading database information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={18} />
          Database Configuration
        </CardTitle>
        <CardDescription>
          Map scraped data to database columns
          {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No selectors configured. Please add selectors in the Preview tab
            before configuring database mappings.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="table-select">Select Table</Label>
              <Select value={selectedTable} onValueChange={handleTableSelect}>
                <SelectTrigger id="table-select">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.name} value={table.name}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Map Selectors to Columns
                  </h4>
                  <div className="space-y-3">
                    {selectors.map((selector) => {
                      const table = tables.find(
                        (t) => t.name === selectedTable,
                      );
                      return (
                        <div
                          key={selector.id}
                          className="grid grid-cols-2 gap-2 items-center"
                        >
                          <div className="text-sm">
                            <span className="font-medium">{selector.name}</span>
                            <span className="text-gray-500 text-xs block truncate">
                              {selector.selector}
                            </span>
                          </div>
                          <Select
                            value={columnMappings[selector.id] || ""}
                            onValueChange={(value) =>
                              handleColumnMappingChange(selector.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-- Skip --</SelectItem>
                              {table?.columns.map((column) => (
                                <SelectItem key={column} value={column}>
                                  {column}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={handleSaveConfig}
                  className="w-full mt-4 flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Database Configuration
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseConfigPanel;
