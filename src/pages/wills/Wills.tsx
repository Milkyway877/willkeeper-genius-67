
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Download, Edit3, Trash2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wills() {
  const [wills] = useState([
    {
      id: 1,
      title: 'My Last Will and Testament',
      status: 'active',
      lastModified: '2024-01-15',
      type: 'Full Will',
      pages: 8
    },
    {
      id: 2,
      title: 'Business Succession Will',
      status: 'draft',
      lastModified: '2024-01-10',
      type: 'Business Will',
      pages: 12
    },
    {
      id: 3,
      title: 'Guardian Appointment Document',
      status: 'active',
      lastModified: '2024-01-05',
      type: 'Guardian Will',
      pages: 4
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout forceAuthenticated={true}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wills</h1>
              <p className="text-gray-600 mt-1">Manage your wills and estate planning documents</p>
            </div>
            <Button asChild className="bg-willtank-600 hover:bg-willtank-700">
              <Link to="/will/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Will
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wills.map((will) => (
              <Card key={will.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-willtank-600" />
                    <Badge className={`text-xs ${getStatusColor(will.status)}`}>
                      {will.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{will.title}</CardTitle>
                  <CardDescription>
                    {will.type} • {will.pages} pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    Last modified: {new Date(will.lastModified).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {wills.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No wills created yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first will</p>
                <Button asChild className="bg-willtank-600 hover:bg-willtank-700">
                  <Link to="/will/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Will
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
