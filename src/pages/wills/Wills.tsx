
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Scroll, Calendar, Shield, Star, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Wills() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample data - in a real app this would come from your database
  const activeWills = [
    { id: '1', title: 'My Primary Will', lastEdited: '2025-02-10', progress: 100, type: 'Standard' },
    { id: '2', title: 'Living Trust', lastEdited: '2025-03-15', progress: 100, type: 'Trust' },
  ];
  
  const unfinishedWills = [
    { id: '3', title: 'Secondary Will', lastEdited: '2025-04-01', progress: 45, type: 'Digital' },
    { id: '4', title: 'Asset Distribution', lastEdited: '2025-04-10', progress: 70, type: 'Standard' },
  ];

  const securityTips = [
    { title: 'Update Your Beneficiaries', description: 'Review your beneficiaries quarterly to ensure your will reflects your current wishes.' },
    { title: 'Keep Digital Copies Secure', description: 'Store encrypted digital versions of your will in multiple secure locations.' },
    { title: 'Review After Major Life Events', description: 'Marriage, divorce, births, and deaths are all reasons to review your will.' },
  ];

  const handleCreateWill = () => {
    navigate('/will/create');
    toast({
      title: "Creating new will",
      description: "Preparing your new will document...",
    });
  };

  const handleViewWill = (willId: string) => {
    navigate(`/will/${willId}`);
  };

  const handleEditWill = (willId: string) => {
    navigate(`/will/edit/${willId}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wills</h1>
              <p className="text-gray-600 text-lg">
                Your central hub for creating and managing all your will documents
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              onClick={handleCreateWill}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Will
            </Button>
          </motion.div>
        </div>

        {/* Main content - Unfinished Wills */}
        {unfinishedWills.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Scroll className="mr-2 h-6 w-6 text-purple-600" />
              Unfinished Wills
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {unfinishedWills.map(will => (
                <Card key={will.id} className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{will.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last edited: {new Date(will.lastEdited).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        In Progress
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Completion</span>
                        <span className="text-sm font-medium">{will.progress}%</span>
                      </div>
                      <Progress 
                        value={will.progress} 
                        className="h-2" 
                        indicatorClassName="bg-yellow-500"
                      />
                    </div>
                    <div className="mt-4 flex items-center">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {will.type} Will
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <div className="w-full flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewWill(will.id)}
                      >
                        Preview
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700" 
                        onClick={() => handleEditWill(will.id)}
                      >
                        Continue Editing
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Wills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-purple-600" />
            Active Wills
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWills.length > 0 ? (
              activeWills.map(will => (
                <Card key={will.id} className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{will.title}</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Last updated: {new Date(will.lastEdited).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4 flex items-center">
                      <Avatar className="h-10 w-10 mr-3 bg-purple-100">
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {will.type.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{will.type} Will</p>
                        <p className="text-xs text-gray-500">100% Complete</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <div className="w-full flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewWill(will.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-purple-700 border-purple-300 hover:bg-purple-50"
                        onClick={() => handleEditWill(will.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="col-span-full border-dashed border-2 border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Active Wills</h3>
                  <p className="text-gray-500 text-center mb-6">
                    You don't have any completed wills yet. Create your first will to get started.
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700" 
                    onClick={handleCreateWill}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Will
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Security Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-purple-600" />
            Security Tips & Best Practices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityTips.map((tip, index) => (
              <Card key={index} className="bg-purple-50 border-purple-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center text-purple-800">
                    <Info className="h-5 w-5 mr-2 text-purple-700" />
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-900">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-8 text-white shadow-xl mt-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-300" />
                Ensure Your Legacy
              </h3>
              <p className="mb-0 text-purple-100">
                A comprehensive will is the cornerstone of estate planning. Start creating yours today.
              </p>
            </div>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-purple-800 hover:bg-purple-100"
              onClick={handleCreateWill}
            >
              Create New Will
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
