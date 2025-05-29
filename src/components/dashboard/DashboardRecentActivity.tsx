
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Users, ArrowRight } from 'lucide-react';

export function DashboardRecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Will updated</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
          <Calendar className="h-4 w-4 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Message scheduled</p>
            <p className="text-xs text-gray-500">1 day ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
          <Users className="h-4 w-4 text-purple-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Contact added</p>
            <p className="text-xs text-gray-500">3 days ago</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild className="w-full mt-3">
          <Link to="/activity">
            View All Activity
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
