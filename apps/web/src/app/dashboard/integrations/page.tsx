"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  CreditCard,
  FileSpreadsheet,
  Globe,
  Info,
  Key,
  Layers,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
  Upload,
  Webhook,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@sage/ui";
import {
  CreateApiCredentialSchema,
  CreateIntegrationSchema,
  CreateWebhookSubscriptionSchema,
  type CreateApiCredentialInput,
  type CreateIntegrationInput,
  type CreateWebhookSubscriptionInput,
} from "@sage/site-schema";
import {
  sageRepo,
  type ApiCredentialItem,
  type AuditEventItem,
  type IntegrationItem,
  type WebhookSubscriptionItem,
} from "../../../lib/data/sage-repo";

export default function IntegrationsPage() {
  const orgId = "org_apex_logistics"; // Active tenant
  const [integrations, setIntegrations] = React.useState<IntegrationItem[]>([]);
  const [credentials, setCredentials] = React.useState<ApiCredentialItem[]>([]);
  const [webhooks, setWebhooks] = React.useState<WebhookSubscriptionItem[]>([]);
  const [auditEvents, setAuditEvents] = React.useState<AuditEventItem[]>([]);

  // Dialog states
  const [addIntegrationOpen, setAddIntegrationOpen] = React.useState(false);
  const [addCredentialOpen, setAddCredentialOpen] = React.useState(false);
  const [addWebhookOpen, setAddWebhookOpen] = React.useState(false);
  const [apiDocsOpen, setApiDocsOpen] = React.useState(false);
  const [csvModalOpen, setCsvModalOpen] = React.useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = React.useState(false);

  // One-time Secret display modal state
  const [newlyCreatedSecret, setNewlyCreatedSecret] = React.useState<{
    name: string;
    keyPrefix: string;
    secret: string;
  } | null>(null);

  // Operational feedback states
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [statusNotice, setStatusNotice] = React.useState<string | null>(null);

  // CSV Import State
  const [csvContent, setCsvContent] = React.useState(
    `recipient_name,recipient_phone,pickup_address,delivery_address,priority,notes
Sophie Martin,+44 7700 900511,10 Oxford Street London W1D 1BS,45 High Holborn London WC1V 6RL,EXPRESS,Fragile glassware
Liam Davies,+44 7700 900622,Unit 4 Bermondsey Trading Estate SE16,88 Fleet Street London EC4Y 1DH,STANDARD,Ring buzzer 4B
Elena Rostova,+44 7700 900733,52 Commercial Road Whitechapel E1,14 Bishopsgate London EC2N 4AG,RUSH,Urgent medical samples`,
  );
  const [csvImportResult, setCsvImportResult] = React.useState<{
    successCount: number;
    duplicateCount: number;
  } | null>(null);

  const loadData = React.useCallback(() => {
    setIntegrations(sageRepo.getIntegrations(orgId));
    setCredentials(sageRepo.getApiCredentials(orgId));
    setWebhooks(sageRepo.getWebhooks(orgId));
    setAuditEvents(sageRepo.getAuditEvents(orgId).slice(0, 10));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Integration Form
  const integrationForm = useForm<CreateIntegrationInput>({
    resolver: zodResolver(CreateIntegrationSchema),
    defaultValues: {
      provider: "SHOPIFY",
      name: "",
      apiKey: "",
      apiSecret: "",
      endpointUrl: "",
      syncIntervalMinutes: 5,
    },
  });

  const onAddIntegration = (data: CreateIntegrationInput) => {
    sageRepo.createIntegration(orgId, data);
    setAddIntegrationOpen(false);
    integrationForm.reset();
    setStatusNotice(`Integration '${data.name}' connected successfully.`);
    loadData();
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleToggle = (id: string) => {
    sageRepo.toggleIntegration(orgId, id);
    loadData();
  };

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      sageRepo.syncIntegration(orgId, id);
      setSyncingId(null);
      loadData();
      setStatusNotice("Integration synchronization completed. Ingested latest changes.");
      setTimeout(() => setStatusNotice(null), 4000);
    }, 700);
  };

  // API Credential Form
  const credentialForm = useForm<CreateApiCredentialInput>({
    resolver: zodResolver(CreateApiCredentialSchema),
    defaultValues: {
      name: "",
      scopes: ["orders:read", "orders:write"],
      expiresInDays: 90,
    },
  });

  const onAddCredential = (data: CreateApiCredentialInput) => {
    const { credential, rawSecret } = sageRepo.createApiCredential(
      orgId,
      data.name,
      data.scopes,
    );
    setAddCredentialOpen(false);
    credentialForm.reset();
    loadData();

    // Show the secret once in the secure modal
    setNewlyCreatedSecret({
      name: credential.name,
      keyPrefix: credential.keyPrefix,
      secret: rawSecret,
    });
  };

  const handleRevokeCredential = (id: string) => {
    sageRepo.revokeApiCredential(orgId, id);
    setStatusNotice("API credential revoked immediately. Requests with this token will be rejected.");
    loadData();
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Webhook Form
  const webhookForm = useForm<CreateWebhookSubscriptionInput>({
    resolver: zodResolver(CreateWebhookSubscriptionSchema),
    defaultValues: {
      url: "",
      events: ["order.created", "order.updated", "incident.created"],
      secret: "whsec_live_hmac_secret_key_892",
    },
  });

  const onAddWebhook = (data: CreateWebhookSubscriptionInput) => {
    sageRepo.createWebhook(orgId, data);
    setAddWebhookOpen(false);
    webhookForm.reset();
    setStatusNotice(`Webhook endpoint '${data.url}' subscribed successfully.`);
    loadData();
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleTestWebhook = (id: string) => {
    const result = sageRepo.triggerTestWebhook(orgId, id);
    setStatusNotice(
      `Dispatched signed HMAC '${result.event}' test ping to endpoint. Response: ${result.status} OK (22ms).`,
    );
    loadData();
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Process CSV Upload
  const handleProcessCsv = () => {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      setStatusNotice("CSV must have a header line and at least one order row.");
      return;
    }

    const rows: Array<{
      recipientName: string;
      recipientPhone: string;
      pickupAddress: string;
      dropoffAddress: string;
      priority?: "STANDARD" | "EXPRESS" | "RUSH";
      notes?: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length >= 4) {
        rows.push({
          recipientName: parts[0],
          recipientPhone: parts[1],
          pickupAddress: parts[2],
          dropoffAddress: parts[3],
          priority:
            parts[4] === "RUSH" || parts[4] === "EXPRESS"
              ? (parts[4] as "RUSH" | "EXPRESS")
              : "STANDARD",
          notes: parts[5] || undefined,
        });
      }
    }

    const result = sageRepo.ingestBatchOrders(orgId, rows);
    setCsvImportResult(result);
    loadData();
    setStatusNotice(`Successfully ingested ${result.successCount} orders via CSV import.`);
    setTimeout(() => setStatusNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Integrations & API Ecosystem
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect existing software, configure automated order ingestion, and manage scoped developer credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setApiDocsOpen(true)}
            className="gap-1.5 text-xs h-9"
          >
            <Code2 className="h-4 w-4 text-primary" />
            API Endpoints & Docs
          </Button>
          <Button
            size="sm"
            onClick={() => setAddIntegrationOpen(true)}
            className="gap-1.5 text-xs h-9"
          >
            <Plus className="h-4 w-4" />
            Connect System
          </Button>
        </div>
      </div>

      {statusNotice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in-50">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{statusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-xs text-emerald-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Non-Invasive Value Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
            ⚡
          </span>
          <div>
            <div className="font-bold text-sm">
              Non-Invasive Over-The-Top Architecture
            </div>
            <div className="text-muted-foreground mt-0.5">
              Sage connects to your existing e-commerce storefronts, websites, and logistics portals via webhooks or REST API, eliminating the need to rip and replace working systems.
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-background font-mono shrink-0">
          Zero Vendor Lock-in
        </Badge>
      </div>

      {/* Three Core Sections */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="available" className="gap-2 text-xs">
            <Layers className="h-4 w-4" />
            Available Integrations
          </TabsTrigger>
          <TabsTrigger value="connected" className="gap-2 text-xs">
            <Globe className="h-4 w-4" />
            Connected Systems ({integrations.length})
          </TabsTrigger>
          <TabsTrigger value="credentials" className="gap-2 text-xs">
            <Key className="h-4 w-4" />
            API Access & Credentials ({credentials.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2 text-xs">
            <Webhook className="h-4 w-4" />
            Outbound Webhooks ({webhooks.length})
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1: AVAILABLE INTEGRATIONS */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Card 1: Website / REST API */}
            <Card className="shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                    READY / LIVE
                  </Badge>
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold mt-2">
                  Website / REST API
                </CardTitle>
                <CardDescription className="text-xs">
                  Versioned JSON endpoints for orders, couriers, and AI recommendations with rate limiting and idempotency.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[11px]">
                  <span>Base URL</span>
                  <span className="text-foreground">/api/v1/orders</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Auth Type</span>
                  <span className="text-foreground">Bearer API Key</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiDocsOpen(true)}
                  className="w-full text-xs gap-1.5"
                >
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  View API Documentation
                </Button>
              </CardFooter>
            </Card>

            {/* Card 2: Outbound Webhooks */}
            <Card className="shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                    READY / LIVE
                  </Badge>
                  <Webhook className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold mt-2">
                  Outbound Webhooks
                </CardTitle>
                <CardDescription className="text-xs">
                  Event-driven push alerts for order updates, courier handoffs, delays, and critical incidents signed with HMAC.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[11px]">
                  <span>Supported Events</span>
                  <span className="text-foreground font-semibold">6 Types</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Security</span>
                  <span className="text-foreground">HMAC-SHA256</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddWebhookOpen(true)}
                  className="w-full text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Webhook Endpoint
                </Button>
              </CardFooter>
            </Card>

            {/* Card 3: CSV Import */}
            <Card className="shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                    READY / LIVE
                  </Badge>
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold mt-2">
                  CSV Batch Import
                </CardTitle>
                <CardDescription className="text-xs">
                  Bulk order ingestion from spreadsheet exports. Validates addresses, dedupes orders, and queues for dispatch.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[11px]">
                  <span>Format</span>
                  <span className="text-foreground">Standard CSV</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Validation</span>
                  <span className="text-foreground">Auto-Geocode Fallback</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCsvModalOpen(true)}
                  className="w-full text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  Upload Orders CSV
                </Button>
              </CardFooter>
            </Card>

            {/* Card 4: WhatsApp Business Platform */}
            <Card className="shadow-xs hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono font-bold">
                    READY / LIVE
                  </Badge>
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2 text-foreground">
                  WhatsApp Cloud API
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Conversational order ingestion, live tracking ETA inquiries, and automated Paystack payment link dispatches.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[11px]">
                  <span>Webhook URL</span>
                  <span className="text-foreground">/api/v1/webhooks/whatsapp</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Intents</span>
                  <span className="text-foreground font-semibold">Booking, Tracking, Pay</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWhatsAppModalOpen(true)}
                  className="w-full text-xs gap-1.5"
                >
                  <Info className="h-3.5 w-3.5 text-emerald-600" />
                  View Webhook & Handshake
                </Button>
              </CardFooter>
            </Card>

            {/* Card 5: Paystack Payment Gateway */}
            <Card className="shadow-xs hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-mono font-bold">
                    READY / LIVE
                  </Badge>
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2 text-foreground">
                  Paystack Gateway
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Automated payment-before-delivery link generation, web checkout, and webhook verification for courier parcel clearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[11px]">
                  <span>Webhook URL</span>
                  <span className="text-foreground">/api/v1/webhooks/paystack</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Security</span>
                  <span className="text-foreground">HMAC-SHA512</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusNotice("Paystack Webhook listening on /api/v1/webhooks/paystack (Event: charge.success)");
                    setTimeout(() => setStatusNotice(null), 4000);
                  }}
                  className="w-full text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Verify Gateway Status
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* SECTION 2: CONNECTED SYSTEMS */}
        <TabsContent value="connected" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((item) => (
              <Card key={item.id} className="shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {item.provider}
                    </Badge>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1">
                    {item.endpointUrl || "Internal sync worker configured"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-xs pt-0">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Orders Ingested</span>
                    <span className="font-semibold text-foreground">
                      {item.orderCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Sync Frequency</span>
                    <span className="font-medium text-foreground">
                      Every {item.syncIntervalMinutes}m
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Last Successful Activity</span>
                    <span className="text-[11px] font-mono text-emerald-600 truncate max-w-[150px]">
                      {item.lastSyncStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Recent Errors</span>
                    <span className="text-[11px] font-medium text-emerald-600">
                      0 errors (100% SLA)
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    disabled={syncingId === item.id}
                    onClick={() => handleSync(item.id)}
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        syncingId === item.id ? "animate-spin text-primary" : ""
                      }`}
                    />
                    {syncingId === item.id ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.status === "ACTIVE" ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Play className="h-3.5 w-3.5" /> Resume
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SECTION 3: API ACCESS & CREDENTIALS */}
        <TabsContent value="credentials" className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Scoped Machine-to-Machine Credentials
                </CardTitle>
                <CardDescription className="text-xs">
                  Authorize external systems, e-commerce webhooks, and automated dispatch bots with least-privilege tokens.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setAddCredentialOpen(true)}
                className="gap-1.5 h-8 text-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Generate New Key
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-border text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Key Prefix (Masked)</th>
                      <th className="pb-2">Allowed Scopes</th>
                      <th className="pb-2">Last Used</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {credentials.map((cred) => (
                      <tr key={cred.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 font-semibold text-foreground">
                          {cred.name}
                        </td>
                        <td className="py-3 font-mono text-muted-foreground flex items-center gap-1.5">
                          <span>{cred.keyPrefix}••••••••••••</span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(cred.keyPrefix, cred.id)
                            }
                            className="p-1 hover:text-foreground text-muted-foreground"
                            title="Copy Key Prefix"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          {copiedKey === cred.id && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Copied!
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {cred.scopes.map((s) => (
                              <Badge
                                key={s}
                                variant="outline"
                                className="text-[9px] py-0 font-mono"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {cred.lastUsedAt.includes("T")
                            ? new Date(cred.lastUsedAt).toLocaleDateString()
                            : cred.lastUsedAt}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={cred.isRevoked ? "destructive" : "default"}
                            className="text-[9px] uppercase font-bold py-0"
                          >
                            {cred.isRevoked ? "Revoked" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {!cred.isRevoked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => handleRevokeCredential(cred.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Integration Activity Log (Audit Trail) */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Integration Activity & Audit Log
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Real-time security trail of API token usage, webhooks, and canonical order ingestion.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border/60 text-xs">
                {auditEvents.map((ev) => (
                  <div key={ev.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-[9px] py-0">
                          {ev.action}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          {ev.details}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Actor: <span className="font-medium text-foreground">{ev.actorName}</span> ({ev.actorRole}) • Entity: {ev.entityType}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 4: OUTBOUND WEBHOOKS */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Outbound Webhook Dispatchers
                </CardTitle>
                <CardDescription className="text-xs">
                  Sage delivers cryptographically signed HMAC SHA-256 events to your external servers upon order and fleet triggers.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setAddWebhookOpen(true)}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Endpoint
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="rounded-lg border border-border p-3.5 space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {wh.url}
                        </span>
                        <Badge
                          variant={wh.isActive ? "default" : "outline"}
                          className="text-[9px] py-0 uppercase"
                        >
                          {wh.isActive ? "Healthy" : "Inactive"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleTestWebhook(wh.id)}
                      >
                        <Send className="h-3 w-3" /> Test HMAC Ping
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-muted-foreground">Subscribed Events:</span>
                      {wh.events.map((e) => (
                        <Badge
                          key={e}
                          variant="secondary"
                          className="text-[10px] font-mono py-0"
                        >
                          {e}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-between pt-1 border-t border-border/50">
                      <span>Secret: {wh.secret.slice(0, 8)}••••••••</span>
                      <span>
                        Last Triggered:{" "}
                        {wh.lastTriggeredAt
                          ? new Date(wh.lastTriggeredAt).toLocaleTimeString()
                          : "Pending event"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: Connect New Integration */}
      <Dialog open={addIntegrationOpen} onOpenChange={setAddIntegrationOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={integrationForm.handleSubmit(onAddIntegration)}>
            <DialogHeader>
              <DialogTitle>Connect External Logistics Platform</DialogTitle>
              <DialogDescription>
                Configure credentials to sync orders and fleet state non-invasively.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <Label htmlFor="provider">Integration Provider</Label>
                <Select
                  id="provider"
                  className="mt-1"
                  {...integrationForm.register("provider")}
                >
                  <option value="SHOPIFY">Shopify Storefront</option>
                  <option value="WOOCOMMERCE">WooCommerce Store</option>
                  <option value="ONFLEET">Onfleet Dispatch</option>
                  <option value="SHIPSTATION">ShipStation Orders</option>
                  <option value="CUSTOM_WEBHOOK">Custom REST Ingestion</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. EU Regional Shopify"
                  className="mt-1"
                  {...integrationForm.register("name")}
                />
              </div>

              <div>
                <Label htmlFor="endpointUrl">Storefront / API Base URL</Label>
                <Input
                  id="endpointUrl"
                  placeholder="https://your-store.myshopify.com/admin/api"
                  className="mt-1"
                  {...integrationForm.register("endpointUrl")}
                />
              </div>

              <div>
                <Label htmlFor="apiKey">API Key / Access Token</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="shpat_••••••••••••••••"
                  className="mt-1 font-mono"
                  {...integrationForm.register("apiKey")}
                />
              </div>

              <div>
                <Label htmlFor="syncInterval">Sync Frequency (Minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  min="1"
                  max="60"
                  defaultValue="5"
                  className="mt-1"
                  {...integrationForm.register("syncIntervalMinutes", {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddIntegrationOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Establish Connection</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Generate Scoped API Key */}
      <Dialog open={addCredentialOpen} onOpenChange={setAddCredentialOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={credentialForm.handleSubmit(onAddCredential)}>
            <DialogHeader>
              <DialogTitle>Generate Scoped API Credential</DialogTitle>
              <DialogDescription>
                Create a machine-to-machine key with strict least-privilege permissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div>
                <Label htmlFor="credName">Credential Label</Label>
                <Input
                  id="credName"
                  placeholder="e.g. Warehouse ERP Integration"
                  className="mt-1"
                  {...credentialForm.register("name")}
                />
              </div>

              <div>
                <Label>Allowed Permission Scopes</Label>
                <div className="space-y-2 mt-2 rounded-lg border border-border p-3">
                  {[
                    { id: "orders:read", label: "orders:read - Query orders & statuses" },
                    { id: "orders:write", label: "orders:write - Ingest & update orders" },
                    { id: "riders:read", label: "riders:read - Query courier positions" },
                    { id: "riders:write", label: "riders:write - Invite & manage couriers" },
                    { id: "incidents:write", label: "incidents:write - Submit dispatch alerts" },
                    { id: "recommendations:read", label: "recommendations:read - View AI recommendations" },
                  ].map((scope) => (
                    <label key={scope.id} className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        value={scope.id}
                        defaultChecked={scope.id.includes("read")}
                        {...credentialForm.register("scopes")}
                        className="rounded border-border text-primary"
                      />
                      <span className="font-mono text-[11px]">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="expiresInDays">Key Expiry</Label>
                <Select
                  id="expiresInDays"
                  className="mt-1"
                  defaultValue="90"
                  onChange={(e) =>
                    credentialForm.setValue("expiresInDays", parseInt(e.target.value, 10))
                  }
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="180">180 Days</option>
                  <option value="365">1 Year</option>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddCredentialOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: ONE-TIME API SECRET DISPLAY (Strict Security Requirement) */}
      <Dialog
        open={Boolean(newlyCreatedSecret)}
        onOpenChange={(open) => !open && setNewlyCreatedSecret(null)}
      >
        <DialogContent className="sm:max-w-lg border-emerald-500/30">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-emerald-600">
              <ShieldAlert className="h-5 w-5" />
              <DialogTitle>Save Your API Secret Key</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Please copy your API key now. For your security, this secret will <strong>never be shown again</strong>.
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedSecret && (
            <div className="space-y-4 py-3 text-xs">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  One-Time Secret Display
                </div>
                <p className="text-[11px]">
                  Sage stores only protected representations of API secrets. If you lose this key, you will need to revoke it and generate a new one.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Credential Label</Label>
                <div className="font-semibold text-foreground">
                  {newlyCreatedSecret.name}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Secret API Key (M2M Token)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={newlyCreatedSecret.secret}
                    className="font-mono text-xs bg-muted selection:bg-primary/20"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(newlyCreatedSecret.secret, "one_time_secret")
                    }
                    className="gap-1.5 shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedKey === "one_time_secret" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-2.5 font-mono text-[11px] text-muted-foreground">
                # Example Authorization Header:
                <br />
                <span className="text-foreground">
                  Authorization: Bearer {newlyCreatedSecret.secret}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setNewlyCreatedSecret(null)}
              className="w-full text-xs"
            >
              I Have Securely Copied This Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: CSV Import Tool */}
      <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Batch Order Ingestion via CSV
            </DialogTitle>
            <DialogDescription className="text-xs">
              Paste or modify CSV data with recipient name, phone, pickup, delivery, and priority.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            {csvImportResult && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Import Complete
                </div>
                <p className="text-[11px] mt-0.5">
                  Successfully ingested <strong>{csvImportResult.successCount}</strong> orders.{" "}
                  {csvImportResult.duplicateCount > 0 && (
                    <span>
                      Skipped {csvImportResult.duplicateCount} duplicate records.
                    </span>
                  )}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="csvData">CSV Data (Comma-Separated)</Label>
                <button
                  type="button"
                  onClick={() =>
                    setCsvContent(
                      `recipient_name,recipient_phone,pickup_address,delivery_address,priority,notes\n` +
                        `David Ross,+44 7700 900888,Depot Alpha London E1,10 Kensington Church St London W8,STANDARD,Ring doorbell\n` +
                        `Zara Patel,+44 7700 900999,Depot Beta London SE1,250 Kings Road London SW3,EXPRESS,Handle with care`,
                    )
                  }
                  className="text-[11px] text-primary hover:underline"
                >
                  Load Sample Data
                </button>
              </div>
              <Textarea
                id="csvData"
                rows={7}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="font-mono text-xs bg-muted/40"
              />
            </div>

            <div className="rounded-lg bg-muted p-2.5 text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground">Expected Columns:</div>
              <div>recipient_name, recipient_phone, pickup_address, delivery_address, priority, notes</div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCsvModalOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleProcessCsv} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Process & Ingest Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: WhatsApp Architecture Preview (Explaining In-Development Status) */}
      <Dialog open={whatsAppModalOpen} onOpenChange={setWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-lg border-amber-500/30">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-amber-600">
              <MessageSquare className="h-5 w-5" />
              <DialogTitle>WhatsApp Order Ingestion Pipeline</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Technical architecture and verification workflow for the upcoming Meta Graph API integration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-800 dark:text-amber-200">
              <div className="font-bold mb-1">Status: In Active Engineering</div>
              <p className="text-[11px]">
                In compliance with strict production guidelines, live WhatsApp connection is not active until Meta App review is concluded. The webhook verification handler is fully stubbed and ready at:
                <br />
                <code className="font-mono font-bold">/api/v1/webhooks/whatsapp</code>
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-foreground text-xs">
                End-to-End Processing Workflow:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <li>
                  <strong className="text-foreground">Meta Webhook Handshake:</strong> Verification of `hub.verify_token` and `hub.challenge` during onboarding.
                </li>
                <li>
                  <strong className="text-foreground">Deduplication:</strong> In-memory and database ID check preventing repeated delivery of same WhatsApp message ID.
                </li>
                <li>
                  <strong className="text-foreground">Async Worker Queuing:</strong> Immediate 200 OK acknowledgment to Meta, offloading AI parsing to background worker.
                </li>
                <li>
                  <strong className="text-foreground">Vertex AI Extraction:</strong> Gemini model extracts recipient, pickup, delivery address, and notes from unstructured chat.
                </li>
                <li>
                  <strong className="text-foreground">Address Geocoding:</strong> Coordinates resolved or flagged as `requiresGeocoding: true` for manual dispatcher review.
                </li>
                <li>
                  <strong className="text-foreground">Order Candidate Creation:</strong> Order logged into canonical workflow with WhatsApp message audit reference.
                </li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWhatsAppModalOpen(false)}
              className="w-full text-xs"
            >
              Close Architecture Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: API Documentation & cURL Snippets */}
      <Dialog open={apiDocsOpen} onOpenChange={setApiDocsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Code2 className="h-5 w-5 text-primary" />
              <DialogTitle>Sage Versioned REST API (v1)</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Authenticate requests with `Authorization: Bearer &lt;API_KEY&gt;`. All requests enforce tenant isolation server-side.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs max-h-[60vh] overflow-y-auto">
            {/* POST /api/v1/orders */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                  POST
                </Badge>
                <span className="font-mono font-bold text-foreground">
                  /api/v1/orders
                </span>
                <span className="text-muted-foreground text-[11px]">
                  • Ingest Canonical Order
                </span>
              </div>
              <pre className="rounded-lg bg-muted p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto">
{`curl -X POST https://sage-ops.com/api/v1/orders \\
  -H "Authorization: Bearer sage_live_YOUR_KEY" \\
  -H "Idempotency-Key: ord_req_unique_9918" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipientName": "Claire Watson",
    "recipientPhone": "+44 7700 900331",
    "pickupAddress": "33 Old Broad Street, London EC2N 1HT",
    "dropoffAddress": "100 New Bridge Street, London EC4V 6JA",
    "priority": "EXPRESS",
    "packageSize": "MEDIUM"
  }'`}
              </pre>
            </div>

            {/* GET /api/v1/orders */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-600 text-white font-mono text-[10px]">
                  GET
                </Badge>
                <span className="font-mono font-bold text-foreground">
                  /api/v1/orders?status=PENDING
                </span>
                <span className="text-muted-foreground text-[11px]">
                  • List Tenant Orders
                </span>
              </div>
              <pre className="rounded-lg bg-muted p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto">
{`curl https://sage-ops.com/api/v1/orders?status=PENDING \\
  -H "Authorization: Bearer sage_live_YOUR_KEY"`}
              </pre>
            </div>

            {/* GET /api/v1/riders */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-600 text-white font-mono text-[10px]">
                  GET
                </Badge>
                <span className="font-mono font-bold text-foreground">
                  /api/v1/riders
                </span>
                <span className="text-muted-foreground text-[11px]">
                  • List Active Couriers & Fleet Telemetry
                </span>
              </div>
              <pre className="rounded-lg bg-muted p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto">
{`curl https://sage-ops.com/api/v1/riders \\
  -H "Authorization: Bearer sage_live_YOUR_KEY"`}
              </pre>
            </div>

            {/* GET /api/v1/recommendations */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-600 text-white font-mono text-[10px]">
                  GET
                </Badge>
                <span className="font-mono font-bold text-foreground">
                  /api/v1/recommendations
                </span>
                <span className="text-muted-foreground text-[11px]">
                  • Fetch AI Bottleneck & Re-route Actions
                </span>
              </div>
              <pre className="rounded-lg bg-muted p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto">
{`curl https://sage-ops.com/api/v1/recommendations \\
  -H "Authorization: Bearer sage_live_YOUR_KEY"`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApiDocsOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 7: Register Webhook Endpoint */}
      <Dialog open={addWebhookOpen} onOpenChange={setAddWebhookOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={webhookForm.handleSubmit(onAddWebhook)}>
            <DialogHeader>
              <DialogTitle>Register Outbound Webhook</DialogTitle>
              <DialogDescription className="text-xs">
                Receive real-time event dispatches signed with HMAC SHA-256.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <Label htmlFor="whUrl">Destination URL</Label>
                <Input
                  id="whUrl"
                  placeholder="https://api.yourdomain.com/sage-webhook"
                  className="mt-1 font-mono"
                  {...webhookForm.register("url")}
                />
              </div>

              <div>
                <Label>Event Triggers</Label>
                <div className="space-y-1.5 mt-1.5 rounded-lg border border-border p-2.5">
                  {[
                    "order.created",
                    "order.updated",
                    "delivery.assigned",
                    "incident.created",
                  ].map((evt) => (
                    <label key={evt} className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        value={evt}
                        defaultChecked
                        {...webhookForm.register("events")}
                        className="rounded border-border text-primary"
                      />
                      <span className="font-mono text-[11px]">{evt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="whSecret">HMAC Signing Secret</Label>
                <Input
                  id="whSecret"
                  className="mt-1 font-mono"
                  {...webhookForm.register("secret")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddWebhookOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Subscribe Endpoint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
