
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Calendar } from 'lucide-react';

export function BillingDashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Professional Plan</p>
              <p className="text-gray-600">$29/month</p>
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Next Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">December 15, 2024</p>
              <p className="text-gray-600">Auto-renewal enabled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Download your invoices</p>
              <Button variant="outline" size="sm">
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
