
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DirectPasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Error", description: "Missing user info", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Invalid", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setSaving(true);

    // Get email for user id
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.email) {
      toast({ title: "Error", description: "Could not find user email", variant: "destructive" });
      setSaving(false);
      return;
    }

    // Update via Supabase Auth
    const { error: upErr } = await supabase.auth.admin.updateUserById(userId, { password });
    if (upErr) {
      toast({ title: "Failed", description: upErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({
      title: "Success!",
      description: "Password reset—sign in with your new password.",
    });

    setTimeout(() => navigate("/auth/signin"), 1800);
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter and confirm your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleReset}>
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={saving}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !password || !confirm}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
