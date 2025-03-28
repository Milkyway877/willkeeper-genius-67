
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Key, Shield, Copy, Download, RefreshCw, Plus, AlertTriangle, 
  Eye, EyeOff, Info, Lock, Unlock, Check, X, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import {
  generateEncryptionKey,
  getUserEncryptionKeys,
  updateEncryptionKeyStatus,
  EncryptionKey
} from '@/services/encryptionService';

export default function Encryption() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'primary' | 'backup' | 'document' | 'access'>('document');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  
  useEffect(() => {
    fetchEncryptionKeys();
  }, []);
  
  const fetchEncryptionKeys = async () => {
    try {
      setLoading(true);
      const userKeys = await getUserEncryptionKeys();
      
      if (userKeys.length > 0) {
        setKeys(userKeys);
      } else {
        // Generate default keys if none exist
        await generateDefaultKeys();
      }
    } catch (error) {
      console.error('Error fetching encryption keys:', error);
      toast({
        title: "Error",
        description: "Failed to load encryption keys. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateDefaultKeys = async () => {
    try {
      // Generate primary key
      const primaryKey = await generateEncryptionKey('Primary Account Key', 'primary');
      
      // Generate backup key
      const backupKey = await generateEncryptionKey('Backup Recovery Key', 'backup');
      
      if (primaryKey && backupKey) {
        setKeys([primaryKey, backupKey]);
      }
    } catch (error) {
      console.error('Error generating default keys:', error);
    }
  };
  
  // Key generation function
  const generateNewKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your new key.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const newKey = await generateEncryptionKey(newKeyName, newKeyType);
      
      if (newKey) {
        setKeys([...keys, newKey]);
        setNewKeyName('');
        
        toast({
          title: "Key Generated",
          description: `Your new ${newKeyType} key has been generated successfully.`,
        });
      } else {
        throw new Error('Failed to generate key');
      }
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate encryption key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Filter keys based on the selected tab
  const filteredKeys = keys.filter(key => {
    if (selectedTab === 'all') return true;
    return key.type === selectedTab;
  });
  
  // Toggle key visibility
  const toggleKeyVisibility = (id: string) => {
    setShowKeys({
      ...showKeys,
      [id]: !showKeys[id]
    });
  };
  
  // Copy key to clipboard
  const copyKeyToClipboard = (id: string) => {
    const key = keys.find(k => k.id === id);
    if (key) {
      navigator.clipboard.writeText(key.value);
      toast({
        title: "Key Copied",
        description: "The encryption key has been copied to your clipboard."
      });
    }
  };
  
  // Download key
  const downloadKey = (id: string, name: string) => {
    const key = keys.find(k => k.id === id);
    if (key) {
      const keyData = `Key Name: ${key.name}\nKey Type: ${key.type}\nAlgorithm: ${key.algorithm}\nCreated: ${new Date(key.created_at).toLocaleDateString()}\n\nKey Value:\n${key.value}`;
      const blob = new Blob([keyData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.key.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Key Downloaded",
        description: "Your encryption key has been downloaded successfully."
      });
    }
  };
  
  // Revoke key
  const revokeKey = async (id: string) => {
    try {
      const success = await updateEncryptionKeyStatus(id, 'revoked');
      
      if (success) {
        setKeys(keys.map(key => 
          key.id === id ? { ...key, status: 'revoked' } : key
        ));
        
        toast({
          title: "Key Revoked",
          description: "The encryption key has been revoked and can no longer be used.",
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to revoke key');
      }
    } catch (error) {
      console.error('Error revoking key:', error);
      toast({
        title: "Error",
        description: "Failed to revoke encryption key. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Activate/Deactivate key
  const toggleKeyStatus = async (id: string) => {
    try {
      const key = keys.find(k => k.id === id);
      if (!key) return;
      
      const newStatus = key.status === 'active' ? 'inactive' : 'active';
      const success = await updateEncryptionKeyStatus(id, newStatus);
      
      if (success) {
        setKeys(keys.map(key => {
          if (key.id === id) {
            return { ...key, status: newStatus };
          }
          return key;
        }));
        
        toast({
          title: `Key ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
          description: `The encryption key has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`
        });
      } else {
        throw new Error(`Failed to ${newStatus === 'active' ? 'activate' : 'deactivate'} key`);
      }
    } catch (error) {
      console.error('Error toggling key status:', error);
      toast({
        title: "Error",
        description: "Failed to update key status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Encryption Keys</h1>
              <p className="text-gray-600">Manage the encryption keys that secure your documents and account.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-willtank-500" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Encryption Keys</h1>
            <p className="text-gray-600">Manage the encryption keys that secure your documents and account.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Generate New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Encryption Key</DialogTitle>
                <DialogDescription>
                  Create a new encryption key to secure your documents or access to your account.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="key-name" className="text-sm font-medium">Key Name</label>
                  <Input
                    id="key-name"
                    placeholder="e.g., My Will Document Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Type</label>
                  <Tabs defaultValue="document" value={newKeyType} onValueChange={(value) => setNewKeyType(value as any)}>
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="primary">Primary</TabsTrigger>
                      <TabsTrigger value="backup">Backup</TabsTrigger>
                      <TabsTrigger value="document">Document</TabsTrigger>
                      <TabsTrigger value="access">Access</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important Information</AlertTitle>
                  <AlertDescription>
                    {newKeyType === 'primary' && "Primary keys are used to secure your entire account. Keep them safe."}
                    {newKeyType === 'backup' && "Backup keys are used for account recovery. Store them in a different location than your primary key."}
                    {newKeyType === 'document' && "Document keys encrypt individual documents. You'll need them to access those documents."}
                    {newKeyType === 'access' && "Access keys can be shared with trusted individuals to grant them limited access to your documents."}
                  </AlertDescription>
                </Alert>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewKeyName('')}>Cancel</Button>
                <Button onClick={generateNewKey} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Generate Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Alert className="mb-8">
          <Shield className="h-4 w-4" />
          <AlertTitle>Encryption Security</AlertTitle>
          <AlertDescription>
            Your documents and personal information are protected with industry-standard encryption. Keep your keys safe and secure.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Keys</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab}>
            <div className="space-y-6">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            key.status === 'active' ? 'bg-green-100 text-green-600' : 
                            key.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 
                            'bg-red-100 text-red-600'
                          }`}>
                            <Key size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium">{key.name}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span className="mr-2">{key.algorithm}</span>
                              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                              <span className="mx-2">{key.type.charAt(0).toUpperCase() + key.type.slice(1)} Key</span>
                              {key.strength && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                  <span className="ml-2">{key.strength}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`mt-4 md:mt-0 px-2 py-1 rounded text-xs font-medium ${
                          key.status === 'active' ? 'bg-green-100 text-green-600' : 
                          key.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 
                          'bg-red-100 text-red-600'
                        }`}>
                          {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 relative w-full md:w-3/4">
                          <div className="font-mono text-sm truncate">
                            {showKeys[key.id] ? 
                              key.value : 
                              '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKeys[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        
                        <div className="flex mt-4 md:mt-0 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyKeyToClipboard(key.id)}
                            disabled={key.status === 'revoked'}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadKey(key.id, key.name)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between border-t border-gray-100 pt-4">
                        <div className="flex flex-col sm:flex-row text-sm text-gray-500 mb-4 sm:mb-0">
                          <span className="mr-4">Created: {new Date(key.created_at).toLocaleDateString()}</span>
                          <span>{key.last_used ? `Last used: ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {key.status !== 'revoked' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleKeyStatus(key.id)}
                            >
                              {key.status === 'active' ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                          )}
                          
                          {key.status !== 'revoked' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <X className="mr-2 h-4 w-4" />
                                  Revoke
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Revoke Encryption Key</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to revoke this key? This action cannot be undone and any documents encrypted with this key will become inaccessible.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={(e) => e.preventDefault()}>Cancel</Button>
                                  <Button variant="destructive" onClick={() => revokeKey(key.id)}>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Revoke Key
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No keys found</h3>
                  <p className="text-gray-500 mb-4">You don't have any encryption keys of this type yet.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate New Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {/* Key generation dialog content same as above */}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-willtank-50 rounded-xl p-6 border border-willtank-100">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-willtank-100 flex items-center justify-center mr-4">
                <Shield className="h-5 w-5 text-willtank-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Key Security Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                    Store your backup keys in a different physical location
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                    Use a password manager to securely store your keys
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                    Never share your primary keys with anyone
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
                    Regularly rotate your encryption keys
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Document Security Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Last Will & Testament</span>
                      <span className="text-green-600 font-medium">Secured</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Medical Directive</span>
                      <span className="text-green-600 font-medium">Secured</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Power of Attorney</span>
                      <span className="text-amber-600 font-medium">Pending</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => toast({
                      title: "Securing Documents",
                      description: "Starting the process to secure all your documents."
                    })}
                  >
                    Secure All Documents
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
