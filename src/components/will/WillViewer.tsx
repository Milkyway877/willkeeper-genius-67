
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Edit, Eye } from 'lucide-react';

interface WillViewerProps {
  willId?: string;
}

export function WillViewer({ willId }: WillViewerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">View Will</h1>
        <p className="text-gray-600">Review and manage your will document.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Will Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg min-h-[400px]">
                <h3 className="text-xl font-bold mb-4">Last Will and Testament</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    I, [Your Name], being of sound mind and disposing memory, do hereby make, publish,
                    and declare this to be my Last Will and Testament, hereby revoking all wills and
                    codicils heretofore made by me.
                  </p>
                  <p>
                    <strong>Article I - Personal Information</strong><br />
                    Full Name: [Your Full Name]<br />
                    Address: [Your Address]<br />
                    Date of Birth: [Your Date of Birth]
                  </p>
                  <p>
                    <strong>Article II - Executor</strong><br />
                    I hereby nominate and appoint [Executor Name] as the Executor of this Will.
                  </p>
                  <p className="text-gray-500 text-sm">
                    [This is a preview of your will document. The complete version contains all sections and details.]
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Will Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Preview Full Will
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Will
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Will Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm">Dec 1, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-sm">Dec 1, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
