import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPortfolioEntrySchema, type InsertPortfolioEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PortfolioInputProps {
  onSubmit: (data: InsertPortfolioEntry) => Promise<void>;
  isLoading?: boolean;
}

export function PortfolioInput({ onSubmit, isLoading = false }: PortfolioInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertPortfolioEntry>({
    resolver: zodResolver(insertPortfolioEntrySchema),
    defaultValues: {
      value: undefined as any,
      date: new Date(),
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: InsertPortfolioEntry) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset({
        value: undefined as any,
        date: new Date(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Add Portfolio Snapshot</CardTitle>
            <CardDescription>Record your total portfolio value</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Value ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="10000.00"
                      data-testid="input-portfolio-value"
                      className="text-2xl font-semibold tabular-nums"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-date-picker"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isSubmitting}
              data-testid="button-save-snapshot"
            >
              {isSubmitting ? "Saving..." : "Save Snapshot"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
