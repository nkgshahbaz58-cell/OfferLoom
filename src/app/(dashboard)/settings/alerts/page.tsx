"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Slack,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  TestTube,
  AlertTriangle,
} from "lucide-react";

interface AlertSettings {
  slackWebhookUrl: string | null;
  emailRecipients: string[];
  riskThreshold: number;
  alertOnPaymentFailed: boolean;
  alertOnCancelPending: boolean;
  alertOnCancellation: boolean;
  weeklyReportEnabled: boolean;
}

export default function AlertSettingsPage() {
  const [settings, setSettings] = useState<AlertSettings>({
    slackWebhookUrl: "",
    emailRecipients: [],
    riskThreshold: 50,
    alertOnPaymentFailed: true,
    alertOnCancelPending: true,
    alertOnCancellation: true,
    weeklyReportEnabled: true,
  });
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    slack: boolean;
    email: boolean;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/alerts/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          slackWebhookUrl: data.slackWebhookUrl || "",
          emailRecipients: data.emailRecipients || [],
          riskThreshold: data.riskThreshold ?? 50,
          alertOnPaymentFailed: data.alertOnPaymentFailed ?? true,
          alertOnCancelPending: data.alertOnCancelPending ?? true,
          alertOnCancellation: data.alertOnCancellation ?? true,
          weeklyReportEnabled: data.weeklyReportEnabled ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/alerts/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          slackWebhookUrl: settings.slackWebhookUrl || null,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/alerts/test", { method: "POST" });
      const data = await response.json();
      setTestResult({
        success: response.ok,
        slack: data.sent?.slack || false,
        email: data.sent?.email || false,
      });
    } catch {
      setTestResult({ success: false, slack: false, email: false });
    } finally {
      setIsTesting(false);
    }
  };

  const addEmail = () => {
    if (emailInput && !settings.emailRecipients.includes(emailInput)) {
      setSettings({
        ...settings,
        emailRecipients: [...settings.emailRecipients, emailInput],
      });
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    setSettings({
      ...settings,
      emailRecipients: settings.emailRecipients.filter((e) => e !== email),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alert Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how and when you receive churn risk alerts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Slack className="h-4 w-4" />
                Slack Webhook URL
              </Label>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slackWebhookUrl || ""}
                onChange={(e) =>
                  setSettings({ ...settings, slackWebhookUrl: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Create an incoming webhook in your Slack workspace
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Recipients
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <Button type="button" variant="outline" onClick={addEmail}>
                  Add
                </Button>
              </div>
              {settings.emailRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.emailRecipients.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeEmail(email)}
                    >
                      {email} &times;
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alert Triggers
            </CardTitle>
            <CardDescription>
              Choose which events trigger alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Payment Failed</Label>
                <p className="text-sm text-muted-foreground">
                  When an invoice payment fails
                </p>
              </div>
              <Switch
                checked={settings.alertOnPaymentFailed}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, alertOnPaymentFailed: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Cancellation Pending</Label>
                <p className="text-sm text-muted-foreground">
                  When subscription set to cancel at period end
                </p>
              </div>
              <Switch
                checked={settings.alertOnCancelPending}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, alertOnCancelPending: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Subscription Cancelled</Label>
                <p className="text-sm text-muted-foreground">
                  When a subscription is cancelled
                </p>
              </div>
              <Switch
                checked={settings.alertOnCancellation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, alertOnCancellation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of revenue at risk
                </p>
              </div>
              <Switch
                checked={settings.weeklyReportEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weeklyReportEnabled: checked })
                }
              />
            </div>

            <div className="pt-4 border-t">
              <Label>Risk Score Threshold</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Alert when score exceeds: {settings.riskThreshold}
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.riskThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    riskThreshold: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saved ? "Saved!" : "Save Settings"}
              </Button>

              <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                {isTesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                Send Test Alert
              </Button>
            </div>

            {testResult && (
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Sent to: {testResult.slack && "Slack"}{" "}
                      {testResult.email && "Email"}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-500">
                    Failed to send test alert
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
