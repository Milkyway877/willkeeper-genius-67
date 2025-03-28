
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  KeyRound,
  PlusCircle,
  RefreshCw,
  Shield,
  Calculator,
  Trash2,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react';
import { generateEncryptionKey, getUserEncryptionKeys, EncryptionKey, updateEncryptionKeyStatus } from '@/services/encryptionService';

export default function Encryption() {
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState('symmetric');
  const [keyAlgorithm, setKeyAlgorithm] = useState('AES');
  const [keyStrength, setKeyStrength] = useState('256');
  const [selectedKey, setSelectedKey] = useState<EncryptionKey | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadEncryptionKeys = async () => {
      try {
        setIsLoading(true);
        const keys = await getUserEncryptionKeys();
        setEncryptionKeys(keys);
      } catch (error) {
        console.error("Error loading encryption keys:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEncryptionKeys();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyName) return;
    
    try {
      setIsGenerating(true);
      const newKey = await generateEncryptionKey(keyName, keyType, keyAlgorithm, keyStrength);
      
      if (newKey) {
        setEncryptionKeys(prevKeys => [...prevKeys, newKey]);
        setKeyName('');
        setIsAddingKey(false);
      }
    } catch (error) {
      console.error("Error adding encryption key:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (keyId: string, status: string) => {
    setIsUpdatingStatus(prev => ({ ...prev, [keyId]: true }));
    
    try {
      const success = await updateEncryptionKeyStatus(keyId, status);
      
      if (success) {
        setEncryptionKeys(prevKeys => 
          prevKeys.map(key => 
            key.id === keyId ? { ...key, status } : key
          )
        );
      }
    } catch (error) {
      console.error("Error updating key status:", error);
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [keyId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <Shield className="mr-2 h-7 w-7 text-primary" />
              Encryption Keys
            </h1>
            <p className="text-muted-foreground">
              Manage your encryption keys for secure document storage
            </p>
          </div>
          
          <Button
            onClick={() => setIsAddingKey(true)}
            className="mt-4 sm:mt-0 flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Generate New Key
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <KeyRound className="mr-2 h-5 w-5" /> Your Encryption Keys
            </CardTitle>
            <CardDescription>
              These keys are used to encrypt and decrypt your sensitive documents and messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : encryptionKeys.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {encryptionKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>{key.algorithm}-{key.strength}</TableCell>
                        <TableCell>{key.type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            key.status === 'active' ? 'bg-green-100 text-green-800' :
                            key.status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {key.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(key.created_at)}</TableCell>
                        <TableCell>{key.last_used ? formatDate(key.last_used) : 'Never'}</TableCell>
                        <TableCell className="text-right">
                          {key.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(key.id, 'revoked')}
                              disabled={isUpdatingStatus[key.id]}
                              className="mr-2"
                            >
                              {isUpdatingStatus[key.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              <span className="ml-1">Revoke</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(key.id, 'active')}
                              disabled={isUpdatingStatus[key.id]}
                              className="mr-2"
                            >
                              {isUpdatingStatus[key.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                              <span className="ml-1">Activate</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-slate-50">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-lg font-medium text-slate-900">No encryption keys found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  You haven't generated any encryption keys yet. 
                  Generate a key to secure your documents and messages.
                </p>
                <Button 
                  onClick={() => setIsAddingKey(true)} 
                  className="mt-4"
                  variant="default"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Generate Your First Key
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-slate-50 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                <span>Total keys: {encryptionKeys.length}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>
                Active keys: {encryptionKeys.filter(key => key.status === 'active').length}
              </span>
            </div>
          </CardFooter>
        </Card>

        <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddKey}>
              <DialogHeader>
                <DialogTitle>Generate New Encryption Key</DialogTitle>
                <DialogDescription>
                  Create a new encryption key for securing your data
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="key-name"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="My encryption key"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key-type" className="text-right">
                    Type
                  </Label>
                  <Select value={keyType} onValueChange={setKeyType}>
                    <SelectTrigger className="col-span-3" id="key-type">
                      <SelectValue placeholder="Select a key type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="symmetric">Symmetric</SelectItem>
                      <SelectItem value="asymmetric">Asymmetric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key-algorithm" className="text-right">
                    Algorithm
                  </Label>
                  <Select value={keyAlgorithm} onValueChange={setKeyAlgorithm}>
                    <SelectTrigger className="col-span-3" id="key-algorithm">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES">AES</SelectItem>
                      <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                      <SelectItem value="Twofish">Twofish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key-strength" className="text-right">
                    Strength
                  </Label>
                  <Select value={keyStrength} onValueChange={setKeyStrength}>
                    <SelectTrigger className="col-span-3" id="key-strength">
                      <SelectValue placeholder="Select key strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128-bit</SelectItem>
                      <SelectItem value="192">192-bit</SelectItem>
                      <SelectItem value="256">256-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!keyName || isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" /> Generate Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
