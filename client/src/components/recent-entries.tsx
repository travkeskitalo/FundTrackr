import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PortfolioEntry } from "@shared/schema";
import { format } from "date-fns";

interface RecentEntriesProps {
  entries: PortfolioEntry[];
  isLoading?: boolean;
}

export function RecentEntries({ entries, isLoading = false }: RecentEntriesProps) {
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const calculateChange = (index: number) => {
    if (index >= sortedEntries.length - 1) return null;
    const current = parseFloat(sortedEntries[index].value);
    const previous = parseFloat(sortedEntries[index + 1].value);
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
          <CardDescription>Your latest portfolio entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  <div className="h-3 bg-muted rounded animate-pulse w-16" />
                </div>
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
          <CardDescription>Your latest portfolio entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first portfolio snapshot to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Snapshots</CardTitle>
        <CardDescription>Your latest portfolio entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry, index) => {
                const change = calculateChange(index);
                const isPositive = change !== null && change >= 0;
                return (
                  <TableRow key={entry.id} data-testid={`row-entry-${index}`}>
                    <TableCell className="font-medium">
                      {format(new Date(entry.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      ${parseFloat(entry.value).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {change !== null ? (
                        <span
                          className={`font-medium tabular-nums ${
                            isPositive ? "text-chart-2" : "text-destructive"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {change.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
