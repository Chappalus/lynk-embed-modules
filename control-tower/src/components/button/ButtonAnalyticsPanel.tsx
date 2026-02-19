import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useButtonAnalytics } from '@/hooks';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Download, TrendingUp, Users, MousePointer, CheckCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface ButtonAnalyticsPanelProps {
  academyId: string;
}

const COLORS = ['#3b6eff', '#10b981', '#f59e0b', '#ef4444'];

export function ButtonAnalyticsPanel({ academyId }: ButtonAnalyticsPanelProps) {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: analytics, isLoading } = useButtonAnalytics(academyId, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    granularity: 'day',
  });

  // Mock data for demo
  const mockData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    impressions: Math.floor(Math.random() * 500) + 100,
    clicks: Math.floor(Math.random() * 100) + 20,
    bookings: Math.floor(Math.random() * 20) + 2,
  }));

  const data = analytics || mockData;

  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);
  const conversionRate = totalImpressions > 0 ? ((totalBookings / totalImpressions) * 100).toFixed(2) : '0';

  const deviceData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 48 },
    { name: 'Tablet', value: 7 },
  ];

  if (isLoading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              className="border rounded-md px-3 py-1.5 text-sm"
              value="30"
              onChange={(e) => {
                const days = parseInt(e.target.value);
                setDateRange({
                  startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
                  endDate: format(new Date(), 'yyyy-MM-dd'),
                });
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Button views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              CTR: {((totalClicks / totalImpressions) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-green-600">↑ 12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Daily impressions, clicks, and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impressions" fill="#3b6eff" name="Impressions" opacity={0.3} />
                <Bar dataKey="clicks" fill="#3b6eff" name="Clicks" />
                <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {deviceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  {entry.name}: {entry.value}%
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Batches</CardTitle>
          <CardDescription>Most booked batches via the button</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Beginner Tennis Camp', bookings: 45, revenue: 134955 },
              { name: 'Weekend Intensive', bookings: 32, revenue: 159968 },
              { name: 'Summer Bootcamp', bookings: 28, revenue: 139972 },
            ].map((batch, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{batch.name}</div>
                  <div className="text-sm text-muted-foreground">{batch.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{batch.revenue.toLocaleString()}</div>
                  <div className="text-sm text-green-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}