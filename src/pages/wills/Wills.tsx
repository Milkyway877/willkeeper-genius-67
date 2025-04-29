
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getWills, Will } from '@/services/willService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Wills() {
  const { data: wills, isLoading, error } = useQuery({
    queryKey: ['wills'],
    queryFn: getWills,
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Wills</h1>
          <Link to="/will/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Will
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your wills...</p>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600">There was an error loading your wills. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {wills && wills.length === 0 && !isLoading && (
          <Card className="text-center p-10 border-dashed">
            <CardContent className="pt-6">
              <div className="mx-auto rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium mb-2">No wills yet</h3>
              <p className="text-gray-500 mb-6">Create your first will to get started</p>
              <Link to="/will/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Will
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {wills && wills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wills.map((will: Will) => (
              <WillCard key={will.id} will={will} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

interface WillCardProps {
  will: Will;
}

function WillCard({ will }: WillCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{will.title}</CardTitle>
          <Badge variant={will.status === 'active' ? 'default' : 'outline'}>
            {will.status === 'active' ? 'Active' : 'Draft'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          {will.template_type || 'Custom Will'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {format(new Date(will.updated_at), 'MMM dd, yyyy')}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link to={`/will/editor?id=${will.id}`}>
          <Button variant="outline" size="sm">
            {will.status === 'active' ? 'View' : 'Edit'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
