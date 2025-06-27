'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceStrict, getYear, getMonth } from 'date-fns';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import type { HistoryEntry } from '../dashboard/triumph-tracker-client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const HISTORY_KEY = 'triumph-tracker-history-v2';

export default function ReportsClient() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const allYears = useMemo(() => {
    if (!history.length) return [];
    const years = new Set(history.map(entry => getYear(new Date(entry.endTime))));
    return Array.from(years).sort((a, b) => b - a);
  }, [history]);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const parsedHistory: HistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];
      setHistory(parsedHistory);
      
      const currentYear = getYear(new Date()).toString();
      const currentMonth = getMonth(new Date()).toString();

      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);

    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setHistory([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const filteredHistory = useMemo(() => {
    if (!selectedYear || !selectedMonth) return history;
    return history.filter(entry => {
      const date = new Date(entry.endTime);
      const yearMatch = getYear(date).toString() === selectedYear;
      const monthMatch = getMonth(date).toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [history, selectedYear, selectedMonth]);

  const chartData = useMemo(() => {
    const dataByType = filteredHistory.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(dataByType).map(([name, count]) => ({ name, count }));
  }, [filteredHistory]);

  if (!isLoaded) {
    return null;
  }
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="container mx-auto max-w-4xl grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Setback Analysis</CardTitle>
          <CardDescription>
            Analyze your setbacks by type over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap flex-col sm:flex-row gap-4">
            <Select value={selectedYear || ''} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {allYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth || ''} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Setbacks by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80 w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                       <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reason</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Ended At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistory.map(entry => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium break-words max-w-[20ch] sm:max-w-md">{entry.reason}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{entry.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {formatDistanceStrict(entry.endTime, entry.startTime)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(entry.endTime), "PPp")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No setbacks recorded for the selected period.</p>
              <p className="text-sm">Keep up the great work!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
