
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { validateRecoveryCode } from "@/services/encryptionService";

export default function RecoveryCodeReset() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedName = name.trim();

      // Find user by name. You may adjust this logic as needed (first_name, last_name, full_name).
      const { data: users, error } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, full_name")
        .ilike("full_name", `%${trimmedName}%`);

      if (error || !users || users.length === 0) {
        toast({
          title: "Not found",
          description: "No user found with that name.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // For Demo: If multiple, just pick the first match
      const user = users[0];

      const valid = await validateRecoveryCode(user.id, code.trim());
      if (!valid) {
        toast({
          title: "Invalid Code",
          description: "The recovery code is invalid or used.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Pass userId (or relevant token) to the 2FA page via navigation state
      navigate("/auth/2fa-verification", { state: { userId: user.id, resetFlow: true } });
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Recovery Reset</CardTitle>
          <CardDescription>
            Enter your name and a recovery code to start resetting your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Jane Doe"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="recoverycode">Recovery Code</Label>
              <Input
                id="recoverycode"
                type="text"
                placeholder="e.g. 1A2B-3C4D-..."
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !name || !code}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Next"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
