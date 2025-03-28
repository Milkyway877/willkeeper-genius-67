import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DeathVerificationWidget } from '@/components/ui/DeathVerificationWidget';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWills, deleteWill } from '@/services/willService';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WillDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [wills, setWills] = useState([]);

  const { isLoading, error, data } = useQuery({
    queryKey: ['wills'],
    queryFn: getWills,
  });

  useEffect(() => {
    if (data) {
      setWills(data);
    }
  }, [data]);

  const deleteWillMutation = useMutation({
    mutationFn: deleteWill,
    onSuccess: () => {
      toast({
        title: "Will Deleted",
        description: "The will has been successfully deleted."
      });
      queryClient.invalidateQueries({ queryKey: ['wills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the will.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteWill = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this will?")) {
      await deleteWillMutation.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Will Dashboard</h1>
            <p className="text-gray-600">Manage all your wills, executors, and beneficiaries</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button asChild>
              <Link to="/will/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New Will
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {wills.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Wills</CardTitle>
                  <CardDescription>Manage and view your existing wills.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <>
                          <TableRow>
                            <TableCell><Skeleton className="h-4 w-[200px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]"/></TableCell>
                            <TableCell className="text-right"></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><Skeleton className="h-4 w-[200px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]"/></TableCell>
                            <TableCell className="text-right"></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><Skeleton className="h-4 w-[200px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]"/></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]"/></TableCell>
                            <TableCell className="text-right"></TableCell>
                          </TableRow>
                        </>
                      )}
                      {!isLoading && wills.map((will) => (
                        <TableRow key={will.id}>
                          <TableCell className="font-medium">{will.title}</TableCell>
                          <TableCell>{will.status}</TableCell>
                          <TableCell>{format(new Date(will.updated_at), 'MMM d, yyyy h:mm a')}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M3 12c0-1.5 2.5-3 5.5-3S14 10.5 14 12s-2.5 3-5.5 3S3 13.5 3 12z" />
                                    <path d="M14 12c0-1.5 2.5-3 5.5-3S22 10.5 22 12s-2.5 3-5.5 3S14 13.5 14 12z" />
                                    <path d="M8 12c0-1.5 2.5-3 5.5-3S19 10.5 19 12s-2.5 3-5.5 3S8 13.5 8 12z" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link to={`/will/${will.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteWill(will.id)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Wills Created Yet</CardTitle>
                  <CardDescription>Get started by creating your first will.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    You haven't created any wills yet. Click the button below to create a new will.
                  </p>
                  <Button asChild>
                    <Link to="/will/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Will
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <DeathVerificationWidget />
          </div>
        </div>
      </div>
    </Layout>
  );
}
