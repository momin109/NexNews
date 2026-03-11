"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash, AlertCircle } from "lucide-react";

const breakingNewsList = [
  {
    id: 1,
    text: "Global markets surge as new economic data shows inflation cooling down significantly.",
    active: true,
    date: "Today, 10:30 AM",
  },
  {
    id: 2,
    text: "Major tech merger announced between industry giants, pending regulatory approval.",
    active: true,
    date: "Today, 09:15 AM",
  },
  {
    id: 3,
    text: "Severe weather warning issued for coastal regions; residents advised to prepare.",
    active: false,
    date: "Yesterday, 14:20 PM",
  },
];

export default function BreakingNews() {
  const [tickerEnabled, setTickerEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Breaking News Ticker
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the scrolling news ticker on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border border-border/50 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Global Ticker</Label>
            <p className="text-xs text-muted-foreground">Show on homepage</p>
          </div>
          <Switch checked={tickerEnabled} onCheckedChange={setTickerEnabled} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Ticker Form */}
        <Card className="border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-destructive" /> Add
              Breaking News
            </CardTitle>
            <CardDescription>Add a new urgent headline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker-text">Headline Text</Label>
              <Input
                id="ticker-text"
                placeholder="e.g. BREAKING: City council passes new zoning laws..."
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="active-status" defaultChecked />
              <Label htmlFor="active-status">Set as Active immediately</Label>
            </div>
            <Button className="w-full gap-2 mt-2">
              <Plus size={16} /> Add to Ticker
            </Button>
          </CardContent>
        </Card>

        {/* Ticker List */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ticker Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Headline Text</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakingNewsList.map((item) => (
                  <TableRow
                    key={item.id}
                    className={!item.active ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      <p className="line-clamp-2 text-sm">{item.text}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.date}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={item.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
