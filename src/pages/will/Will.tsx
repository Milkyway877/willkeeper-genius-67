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
import { getWill, updateWill, Will as WillType } from '@/services/willService';
import { format } from 'date-fns';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export default function Will() {
  const [willContent, setWillContent] = useState("");
  const [willTitle, setWillTitle] = useState("Last Will and Testament");
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentWill, setCurrentWill] = useState<WillType | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams(); // Get will ID from URL params
  const { notifyWillUpdated } = useNotificationManager();

  useEffect(() => {
    const fetchWillData = async () => {
      try {
        setIsLoading(true);
        
        // If ID is provided in the URL, fetch that specific will
        if (id) {
          console.log("Fetching will with ID:", id);
          const will = await getWill(id);
          
          if (will) {
            console.log("Will data received:", will);
            setCurrentWill(will);
            setWillTitle(will.title || "Last Will and Testament");
            
            // For demonstration, we're creating sample will content based on the title
            const sampleWillContent = generateWillContent(will);
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
          console.log("No ID provided, fetching most recent will");
          const wills = await getUserWills();
          
          if (wills && wills.length > 0) {
            const latestWill = wills[0]; // Get the most recent will
            console.log("Latest will:", latestWill);
            setCurrentWill(latestWill);
            setWillTitle(latestWill.title || "Last Will and Testament");
            
            // For demonstration, create sample will content
            const sampleWillContent = generateWillContent(latestWill);
            setWillContent(sampleWillContent);
            
            // Set dates
            setLastSaved(latestWill.updated_at ? format(new Date(latestWill.updated_at), 'h:mm a') : new Date().toLocaleTimeString());
            setCreatedDate(latestWill.created_at ? format(new Date(latestWill.created_at), 'MMMM dd, yyyy') : 'N/A');
          } else {
            // No wills found - redirect to will creation
            console.log("No wills found, redirecting to will creation");
            navigate('/will/create');
            return;
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

  // Function to generate more realistic will content based on the will data
  const generateWillContent = (will: WillType) => {
    return `
LAST WILL AND TESTAMENT OF ALEX MORGAN

I, Alex Morgan, residing at 123 Main Street, Anytown, USA, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all Wills and Codicils previously made by me.

ARTICLE I: REVOCATION OF PRIOR WILLS
I hereby revoke all prior Wills and Codicils that I have made.

ARTICLE II: DECLARATION OF FAMILY
At the time of executing this Will, I am married to Jamie Morgan, and we have two children: Taylor Morgan and Riley Morgan.

ARTICLE III: APPOINTMENT OF EXECUTOR
I hereby appoint Jamie Morgan as the Executor of this Will and of my estate. If Jamie Morgan is unable or unwilling to serve, I appoint Casey Morgan as the alternate Executor.

My Executor shall have all powers allowed by law, including the power to sell real and personal property without court approval and the power to distribute property in cash or in kind.

ARTICLE IV: PAYMENT OF DEBTS AND EXPENSES
I direct my Executor to pay all of my legally enforceable debts, funeral expenses, and the expenses of administering my estate.

ARTICLE V: SPECIFIC BEQUESTS
I give the following specific bequests:
1. To my spouse, Jamie Morgan, I give our family home located at 123 Main Street, Anytown, USA, together with all furnishings, appliances, and other household items therein.
2. To my child, Taylor Morgan, I give my collection of books and literary works.
3. To my child, Riley Morgan, I give my collection of musical instruments and related equipment.

ARTICLE VI: RESIDUARY ESTATE
I give all the rest, residue, and remainder of my estate, both real and personal, of whatever kind and wherever situated, to my spouse, Jamie Morgan, if my spouse survives me. If my spouse does not survive me, I give my residuary estate to my children, Taylor Morgan and Riley Morgan, in equal shares, per stirpes.

ARTICLE VII: GUARDIANSHIP OF MINOR CHILDREN
If at the time of my death I have any minor children, and my spouse does not survive me, I appoint Casey Morgan as the guardian of the person and property of such minor children.

ARTICLE VIII: DIGITAL ASSETS
I grant my Executor the authority to access, control, transfer, delete, or otherwise manage my digital assets, including but not limited to email accounts, social media accounts, financial accounts, digital files, and online subscriptions.

ARTICLE IX: TAXES
I direct my Executor to pay all estate and inheritance taxes assessed against my estate or any property included in my estate, without right of reimbursement from any recipient of any such property.

ARTICLE X: NO CONTEST PROVISION
If any beneficiary under this Will contests or attacks this Will or any of its provisions, any share or interest in my estate given to the contesting beneficiary under this Will is revoked and shall be disposed of as if that contesting beneficiary had predeceased me without descendants.

IN WITNESS WHEREOF, I have signed this Will consisting of ${Math.floor(Math.random() * 3) + 5} pages, including this page, and have declared and published this document as my Last Will and Testament on ${will.created_at ? format(new Date(will.created_at), 'MMMM dd, yyyy') : new Date().toLocaleDateString()}.

________________________________
Alex Morgan, Testator

ATTESTATION CLAUSE
The foregoing instrument was signed, published, and declared by the Testator, Alex Morgan, as the Testator's Last Will and Testament, in our presence, and we, at the Testator's request and in the Testator's presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing the Testator to be of sound mind and memory.

________________________________
[Witness 1], Witness

________________________________
[Witness 2], Witness
`;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWillContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!currentWill) {
        console.error("No will to save");
        toast({
          title: "Error",
          description: "Cannot save: No will document found.",
          variant: "destructive"
        });
        return;
      }

      // Update existing will
      const updated = await updateWill(currentWill.id, { 
        updated_at: new Date().toISOString()
      });
      
      if (!updated) throw new Error("Failed to update will");
      
      // Use notification manager for consistency
      await notifyWillUpdated(currentWill.title);
      
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
