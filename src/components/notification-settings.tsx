"use client";

/**
 * Notification Settings Component
 *
 * Allows users to toggle email notifications on/off
 * Use this in your profile page
 */

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  initialEmailNotificationsEnabled: boolean;
}

export function NotificationSettings({
  initialEmailNotificationsEnabled,
}: NotificationSettingsProps) {
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    initialEmailNotificationsEnabled
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/profile/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotificationsEnabled: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }

      setEmailNotificationsEnabled(checked);

      toast({
        title: "Settings updated",
        description: checked
          ? "You'll now receive email notifications"
          : "Email notifications have been turned off",
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose how you want to be notified about messages and matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2">
          <Label
            htmlFor="email-notifications"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span className="font-medium">Email notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Email me when I get new messages or matches
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={emailNotificationsEnabled}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
