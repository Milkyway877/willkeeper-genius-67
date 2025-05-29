
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Home } from 'lucide-react';

export function TemplateWillCreation() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Will from Template</h1>
        <p className="text-gray-600">Choose from our professionally crafted will templates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Simple Will
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Perfect for individuals with straightforward estate planning needs.
            </p>
            <Button className="w-full">Use This Template</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Family Will
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Comprehensive template for families with children and multiple beneficiaries.
            </p>
            <Button className="w-full">Use This Template</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Property Will
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Specialized template for those with significant real estate holdings.
            </p>
            <Button className="w-full">Use This Template</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
