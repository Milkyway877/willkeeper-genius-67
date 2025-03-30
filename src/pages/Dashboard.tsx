import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, FileText, Users, Calendar, MessageSquare, Heart, ArrowUpRight } from 'lucide-react';
import { InstallButton } from '@/components/pwa/InstallButton';
import { useUserProfile } from '@/contexts/UserProfileContext';

export default function Dashboard() {
  const { profile } = useUserProfile();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Hello, {firstName}!</h1>
            <p className="text-gray-500">Welcome to your WillTank dashboard.</p>
          </div>
          
          <div className="w-full md:w-64">
            <InstallButton />
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Wills Created</CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-sm text-gray-500">
                    +20% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-gray-500">
                    +10% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Messages</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-sm text-gray-500">
                    +5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions with WillTank</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-none pl-0">
                    <li className="py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">New message created</p>
                        <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </li>
                    <li className="py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">Will updated</p>
                        <span className="ml-auto text-xs text-gray-500">5 hours ago</span>
                      </div>
                    </li>
                    <li className="py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">Profile information edited</p>
                        <span className="ml-auto text-xs text-gray-500">1 day ago</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>Quick access to your important files</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-none pl-0">
                    <li className="py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">Last Will and Testament</p>
                        <a href="#" className="ml-auto text-xs text-blue-500 hover:underline flex items-center">
                          View <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </li>
                    <li className="py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium">Living Will</p>
                        <a href="#" className="ml-auto text-xs text-blue-500 hover:underline flex items-center">
                          View <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
