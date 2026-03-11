"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, UploadCloud, Link as LinkIcon, Lock } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUpdatePassword = async () => {
    setUpdatingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.message || "Failed to update password");
        return;
      }

      setPasswordMessage(data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            General Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your website's core configuration.
          </p>
        </div>
        <Button className="gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="general">Site Identity</TabsTrigger>
          <TabsTrigger value="security">Admin & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Website Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Website Name</Label>
                <Input id="site-name" defaultValue="Daily Post News" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Copyright Text</Label>
                <Input
                  id="footer-text"
                  defaultValue="© 2024 Daily Post News. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Branding</CardTitle>
              <CardDescription>Upload your logo and favicon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="space-y-2 flex-1">
                  <Label>Main Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors h-24">
                    <div className="text-center flex flex-col items-center">
                      <UploadCloud
                        size={20}
                        className="text-muted-foreground mb-1"
                      />
                      <span className="text-xs font-medium">
                        Upload Logo (PNG, SVG)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 w-32">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors h-24">
                    <div className="text-center flex flex-col items-center">
                      <span className="text-xs font-medium">32x32</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>
                Links shown in the header/footer of your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  Facebook URL
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/yourpage"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  YouTube URL
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/c/yourchannel"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  X (Twitter) URL
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/yourhandle"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50 shadow-sm border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock size={18} /> Change Admin Password
              </CardTitle>
              <CardDescription>
                Update your dashboard login credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pass">Current Password</Label>
                <Input
                  id="current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirm New Password</Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              {passwordMessage && (
                <p className="text-sm text-green-600">{passwordMessage}</p>
              )}

              <Button
                variant="secondary"
                className="mt-2"
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
