
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Will, getWills } from '@/services/willService';

interface AttachWillToMediaProps {
  mediaId: string;
  mediaType: 'video' | 'document' | 'image';
  onAttach?: (willId: string) => Promise<void>;
}

export function AttachWillToMedia({ mediaId, mediaType, onAttach }: AttachWillToMediaProps) {
  const [wills, setWills] = useState<Will[]>([]);
  const [selectedWillId, setSelectedWillId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load user's active wills
    const loadWills = async () => {
      const userWills = await getWills();
      const activeWills = userWills.filter(will => will.status === 'active');
      setWills(activeWills);
      
      if (activeWills.length > 0) {
        setSelectedWillId(activeWills[0].id);
      }
    };
    
    loadWills();
  }, []);

  const handleAttach = async () => {
    if (!selectedWillId) {
      toast({
        title: "No Will Selected",
        description: "Please select a will to attach.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (onAttach) {
        await onAttach(selectedWillId);
      }
      
      setIsAttached(true);
      
      toast({
        title: "Successfully Attached",
        description: `The ${mediaType} has been attached to the selected will.`,
      });
    } catch (error) {
      console.error(`Error attaching ${mediaType} to will:`, error);
      toast({
        title: "Error",
        description: `There was a problem attaching this ${mediaType} to the will.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attach to Will</CardTitle>
        <CardDescription>
          Link this {mediaType} to one of your wills for reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wills.length > 0 ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="will-select">Select Will</Label>
                <Select 
                  disabled={isAttached}
                  value={selectedWillId} 
                  onValueChange={setSelectedWillId}
                >
                  <SelectTrigger id="will-select">
                    <SelectValue placeholder="Select a will to attach" />
                  </SelectTrigger>
                  <SelectContent>
                    {wills.map((will) => (
                      <SelectItem key={will.id} value={will.id}>
                        {will.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {isAttached ? (
                <Button disabled variant="outline" className="w-full text-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  Attached to Will
                </Button>
              ) : (
                <Button 
                  onClick={handleAttach} 
                  disabled={loading || !selectedWillId}
                  className="w-full"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Attach to Selected Will
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p>You don't have any finalized wills</p>
            <p className="text-sm mt-1">
              Finalize a will first and then attach this {mediaType} to it
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
