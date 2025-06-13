
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Plus, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Vault
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/dashboardService';
import { DeathVerificationWidget } from '@/components/death-verification/DeathVerificationWidget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts - in real app, this would come from your services
const activityData = [
  { name: 'Mon', activities: 4 },
  { name: 'Tue', activities: 7 },
  { name: 'Wed', activities: 3 },
  { name: 'Thu', activities: 8 },
  { name: 'Fri', activities: 6 },
  { name: 'Sat', activities: 2 },
  { name: 'Sun', activities: 5 },
];

const QuickActionCard = ({ icon: Icon, title, description, href, color = "willtank" }: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color?: string;
}) => (
  <Link to={href} className="group">
    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border-l-4 border-l-transparent hover:border-l-willtank-500">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-willtank-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-willtank-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const StatCard = ({ icon: Icon, title, value, change, color = "blue", isLoading = false }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  color?: string;
  isLoading?: boolean;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
          </div>
        </div>
        {change && !isLoading && (
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data: dashboardSummary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary
  });
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your account.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild className="bg-willtank-600 hover:bg-willtank-700">
              <Link to="/will/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Will
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview - Now using real data */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            title="Active Wills"
            value={dashboardSummary?.activeWills || 0}
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            icon={Vault}
            title="Messages in Tank"
            value={dashboardSummary?.messagesInTank || 0}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            icon={Users}
            title="Trusted Contacts"
            value={dashboardSummary?.trustedContacts || 0}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            icon={Shield}
            title="Security Score"
            value={isLoading ? "..." : `${dashboardSummary?.securityScore || 0}%`}
            color="amber"
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <QuickActionCard
                  icon={FileText}
                  title="Create Will"
                  description="Start creating a new will with our guided wizard"
                  href="/will/create"
                />
                <QuickActionCard
                  icon={Vault}
                  title="Add Message to Tank"
                  description="Schedule a future message for your loved ones"
                  href="/tank/create"
                />
                <QuickActionCard
                  icon={Users}
                  title="Manage Contacts"
                  description="Add or update your trusted contacts and beneficiaries"
                  href="/tank?tab=verification"
                />
                <QuickActionCard
                  icon={Shield}
                  title="Security Settings"
                  description="Review and update your account security"
                  href="/settings"
                />
              </div>
            </div>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-willtank-600" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>
                  Your account activity over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Status */}
            <Card className="border-l-4 border-l-willtank-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 mr-2 text-willtank-600" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className={`h-3 w-3 rounded-full mr-2 ${
                        dashboardSummary?.securityStatus === 'Strong' ? 'bg-green-500' :
                        dashboardSummary?.securityStatus === 'Good' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}></div>
                      <span className="font-medium">
                        {dashboardSummary?.securityStatus || 'Loading...'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Your account security is currently rated as{' '}
                      <span className="font-medium">{dashboardSummary?.securityStatus}</span>.
                      {dashboardSummary?.securityStatus !== 'Strong' && ' Consider enabling two-factor authentication.'}
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to="/settings">
                        Review Security Settings
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Death Verification Widget */}
            <DeathVerificationWidget />

            {/* Recent Activity - Now using real data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ) : dashboardSummary?.recentActivity && dashboardSummary.recentActivity.length > 0 ? (
                  dashboardSummary.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      {activity.type === 'will' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : activity.type === 'message' ? (
                        <Calendar className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Users className="h-4 w-4 text-purple-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
                <Button variant="ghost" size="sm" asChild className="w-full mt-3">
                  <Link to="/activity">
                    View All Activity
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
