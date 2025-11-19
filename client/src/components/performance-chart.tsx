import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PortfolioEntry, MarketIndexData } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  entries: PortfolioEntry[];
  marketData?: MarketIndexData[];
  isLoading?: boolean;
}

export function PerformanceChart({ entries, marketData = [], isLoading = false }: PerformanceChartProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<string>>(new Set());

  // Helper to get computed CSS variable values for Chart.js
  const getCSSVar = (varName: string): string => {
    if (typeof window === 'undefined') return '#000000';
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    // If it's in H S L format (space-separated), convert to hsl()
    if (value && !value.startsWith('#') && !value.startsWith('rgb') && !value.startsWith('hsl')) {
      return `hsl(${value})`;
    }
    return value || '#000000';
  };

  const toggleIndex = (symbol: string) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(symbol)) {
      newSet.delete(symbol);
    } else {
      newSet.add(symbol);
    }
    setSelectedIndices(newSet);
  };

  const chartData = useMemo(() => {
    if (!entries.length) return null;

    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate percentage changes from first entry
    const baseValue = parseFloat(sortedEntries[0].value);
    const labels = sortedEntries.map((entry) =>
      new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const portfolioData = sortedEntries.map((entry) => {
      const value = parseFloat(entry.value);
      return ((value - baseValue) / baseValue) * 100;
    });

    const datasets = [
      {
        label: "Your Portfolio",
        data: portfolioData,
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "transparent",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
    ];

    // Add selected market indices - align them with portfolio dates and recalculate baseline
    marketData.forEach((market, index) => {
      if (selectedIndices.has(market.symbol)) {
        const colors = [
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
          "hsl(var(--chart-4))",
          "hsl(var(--chart-5))",
        ];
        
        // Create a map of market percentage data by date
        const marketDataMap = new Map(
          market.data.map(d => [d.date, d.percentChange])
        );
        
        // Get the first portfolio entry date as our new baseline
        const firstPortfolioDate = new Date(sortedEntries[0].date).toISOString().split('T')[0];
        const baselineMarketPercent = marketDataMap.get(firstPortfolioDate);
        
        // Reconstruct actual price levels from percentages, then recalculate from new baseline
        const alignedMarketData = sortedEntries.map(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          const marketPercent = marketDataMap.get(entryDate);
          
          if (baselineMarketPercent !== undefined && marketPercent !== undefined) {
            // Reconstruct relative prices from percentages (using 100 as arbitrary base)
            // If percent = ((price - base) / base) * 100, then price = base * (1 + percent/100)
            const basePrice = 100; // Arbitrary baseline
            const baselinePrice = basePrice * (1 + baselineMarketPercent / 100);
            const currentPrice = basePrice * (1 + marketPercent / 100);
            
            // Calculate percentage change from portfolio baseline date
            const percentChange = ((currentPrice - baselinePrice) / baselinePrice) * 100;
            return percentChange;
          }
          return null;
        });
        
        datasets.push({
          label: market.name,
          data: alignedMarketData as number[],
          borderColor: colors[index % colors.length],
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.4,
          fill: false,
          spanGaps: true, // Connect points even if some dates are missing
        } as any);
      }
    });

    return {
      labels,
      datasets,
    };
  }, [entries, marketData, selectedIndices]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
          color: getCSSVar('--foreground'),
        },
      },
      tooltip: {
        backgroundColor: getCSSVar('--popover'),
        titleColor: getCSSVar('--popover-foreground'),
        bodyColor: getCSSVar('--popover-foreground'),
        borderColor: getCSSVar('--border'),
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += context.parsed.y.toFixed(2) + "%";
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return value.toFixed(0) + "%";
          },
          font: {
            family: "Inter, sans-serif",
          },
          color: getCSSVar('--muted-foreground'),
        },
        grid: {
          color: getCSSVar('--border'),
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
          },
          color: getCSSVar('--muted-foreground'),
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Performance Chart</CardTitle>
          <CardDescription>Track your portfolio's percentage change over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Performance Chart</CardTitle>
          <CardDescription>Track your portfolio's percentage change over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No portfolio data yet</p>
              <p className="text-sm text-muted-foreground">Add your first snapshot to see the chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">Performance Chart</CardTitle>
        <CardDescription>Your portfolio vs market indices (% change)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {marketData.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm font-semibold mb-3 text-foreground">Compare with Market Indices</p>
            <div className="flex flex-wrap gap-4">
              {marketData.map((market) => (
                <div key={market.symbol} className="flex items-center gap-2">
                  <Checkbox
                    id={market.symbol}
                    checked={selectedIndices.has(market.symbol)}
                    onCheckedChange={() => toggleIndex(market.symbol)}
                    data-testid={`checkbox-${market.symbol.toLowerCase()}`}
                  />
                  <Label
                    htmlFor={market.symbol}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {market.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="w-full h-[400px]" data-testid="chart-performance">
          {chartData && <Line data={chartData} options={options} />}
        </div>
      </CardContent>
    </Card>
  );
}
