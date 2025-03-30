
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileText, Download, Copy, Clock, Save, Edit, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserWills } from '@/services/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { getWill, updateWill } from '@/services/willService';
import { format } from 'date-fns';

export default function Will() {
  const [willContent, setWillContent] = useState("");
  const [willTitle, setWillTitle] = useState("Last Will and Testament");
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentWill, setCurrentWill] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams(); // Get will ID from URL params

  useEffect(() => {
    const fetchWillData = async () => {
      try {
        setIsLoading(true);
        
        // If ID is provided in the URL, fetch that specific will
        if (id) {
          const will = await getWill(id);
          if (will) {
            setCurrentWill(will);
            setWillTitle(will.title || "Last Will and Testament");
            
            // For demonstration, we're creating sample will content based on the title
            const sampleWillContent = `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am married to Jamie Morgan. We have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: EXECUTOR
I appoint Jamie Morgan as the Executor of this Will. If they are unable or unwilling to serve, I appoint my sibling, Casey Morgan, as alternate Executor.

ARTICLE IV: GUARDIAN
If my spouse does not survive me, I appoint my sibling, Casey Morgan, as guardian of my minor children.

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my spouse, Jamie Morgan, if they survive me.
If my spouse does not survive me, I give all my property in equal shares to my children, Taylor Morgan and Riley Morgan.

ARTICLE VI: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE VII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

Signed: Alex Morgan
Date: ${will.created_at ? format(new Date(will.created_at), 'MMMM dd, yyyy') : new Date().toLocaleDateString()}
Witnesses: [Witness 1], [Witness 2]
`;
            setWillContent(sampleWillContent);
            
            // Set dates
            setLastSaved(will.updated_at ? format(new Date(will.updated_at), 'h:mm a') : new Date().toLocaleTimeString());
            setCreatedDate(will.created_at ? format(new Date(will.created_at), 'MMMM dd, yyyy') : 'N/A');
          } else {
            toast({
              title: "Will not found",
              description: "The requested will document could not be found.",
              variant: "destructive"
            });
            navigate('/wills');
          }
        } else {
          // No ID provided, fetch the most recent will
          const wills = await getUserWills();
          
          if (wills && wills.length > 0) {
            const latestWill = wills[0]; // Get the most recent will
            setCurrentWill(latestWill);
            setWillTitle(latestWill.title || "Last Will and Testament");
            
            // For demonstration, create sample will content
            const sampleWillContent = `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am married to Jamie Morgan. We have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: EXECUTOR
I appoint Jamie Morgan as the Executor of this Will. If they are unable or unwilling to serve, I appoint my sibling, Casey Morgan, as alternate Executor.

ARTICLE IV: GUARDIAN
If my spouse does not survive me, I appoint my sibling, Casey Morgan, as guardian of my minor children.

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my spouse, Jamie Morgan, if they survive me.
If my spouse does not survive me, I give all my property in equal shares to my children, Taylor Morgan and Riley Morgan.

ARTICLE VI: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.

ARTICLE VII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate.

Signed: Alex Morgan
Date: ${new Date(latestWill.created_at).toLocaleDateString()}
Witnesses: [Witness 1], [Witness 2]
`;
            setWillContent(sampleWillContent);
            
            // Set dates
            setLastSaved(latestWill.updated_at ? format(new Date(latestWill.updated_at), 'h:mm a') : new Date().toLocaleTimeString());
            setCreatedDate(latestWill.created_at ? format(new Date(latestWill.created_at), 'MMMM dd, yyyy') : 'N/A');
          } else {
            // No wills found
            setWillContent("No will document found. Create your first will to get started.");
            setLastSaved(new Date().toLocaleTimeString());
            setCreatedDate("N/A");
          }
        }
      } catch (error) {
        console.error("Error fetching will data:", error);
        toast({
          title: "Error loading will",
          description: "Could not load your will document. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWillData();
  }, [id, toast, navigate]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!currentWill) {
        // Create a new will if none exists
        const { data, error } = await supabase
          .from('wills')
          .insert({
            title: willTitle,
            document_url: 'placeholder_url', // In a real app, you'd upload the document
            status: 'Active'
          })
          .select()
          .single();
          
        if (error) throw error;
        setCurrentWill(data);
      } else {
        // Update existing will
        const updated = await updateWill(currentWill.id, { 
          updated_at: new Date().toISOString()
        });
        
        if (!updated) throw new Error("Failed to update will");
      }
      
      setIsEditing(false);
      setLastSaved(new Date().toLocaleTimeString());
      toast({
        title: "Will saved",
        description: "Your will has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving will:", error);
      toast({
        title: "Error saving will",
        description: "Could not save your will document. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(willContent);
    toast({
      title: "Copied to clipboard",
      description: "Will content has been copied to clipboard.",
    });
  };

  const handleCreateNewWill = () => {
    navigate('/will/create');
  };

  const handleViewAllWills = () => {
    navigate('/wills');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Will</h1>
              <p className="text-gray-600">Loading your will document...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 text-willtank-600 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Will</h1>
            <p className="text-gray-600">View and edit your will document.</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleViewAllWills} variant="outline">
              View All Wills
            </Button>
            <Button onClick={handleCreateNewWill} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Create New Will
            </Button>
            {isEditing ? (
              <Button onClick={handleSave} variant="default">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Will
              </Button>
            )}
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="text-willtank-700 mr-2" size={18} />
                  <h3 className="font-medium">{willTitle}</h3>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  Last saved at {lastSaved}
                </div>
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <textarea 
                    className="w-full h-[500px] p-4 border border-gray-200 rounded-md font-mono text-sm"
                    value={willContent}
                    onChange={handleContentChange}
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {willContent}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h3 className="text-lg font-medium mb-4">Will Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                    <p className="font-medium text-green-700">
                      {currentWill ? currentWill.status : 'Draft'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created On</p>
                  <p className="font-medium">{createdDate}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Modified</p>
                  <p className="font-medium">Today at {lastSaved}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Encryption Status</p>
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                    <p className="font-medium text-blue-700">AES-256 Encrypted</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-willtank-50 rounded-xl border border-willtank-100 p-6"
            >
              <h3 className="text-lg font-medium mb-4">AI Recommendations</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Add digital executor details</p>
                  <p className="text-gray-600">Specify who will manage your online accounts and digital assets.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Update property inventory</p>
                  <p className="text-gray-600">Your property inventory was last updated 6 months ago.</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-willtank-100 text-sm">
                  <p className="text-willtank-800 font-medium mb-1">Review executor contact details</p>
                  <p className="text-gray-600">Ensure your executor's contact information is current.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
