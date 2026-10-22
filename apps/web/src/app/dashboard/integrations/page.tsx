"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Copy,
  Key,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
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
} from "@sage/ui";
import {
  CreateApiCredentialSchema,
  CreateIntegrationSchema,
  CreateWebhookSubscriptionSchema,
  type CreateApiCredentialInput,
  type CreateIntegrationInput,
  type CreateWebhookSubscriptionInput,
} from "@sage/site-schema";
import { sageRepo, type ApiCredentialItem, type IntegrationItem, type WebhookSubscriptionItem } from "../../../lib/data/sage-repo";

export default function IntegrationsPage() {
  const orgId = "org_apex_logistics"; // Active tenant
  const [integrations, setIntegrations] = React.useState<IntegrationItem[]>([]);
  const [credentials, setCredentials] = React.useState<ApiCredentialItem[]>([]);
  const [webhooks, setWebhooks] = React.useState<WebhookSubscriptionItem[]>([]);
  const [addIntegrationOpen, setAddIntegrationOpen] = React.useState(false);
  const [addCredentialOpen, setAddCredentialOpen] = React.useState(false);
  const [addWebhookOpen, setAddWebhookOpen] = React.useState(false);
  const [testWebhookResult, setTestWebhookResult] = React.useState<string | null>(null);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setIntegrations(sageRepo.getIntegrations(orgId));
    setCredentials(sageRepo.getApiCredentials(orgId));
    setWebhooks(sageRepo.getWebhooks(orgId));
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
    loadData();
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
    }, 600);
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
    sageRepo.createApiCredential(orgId, data.name, data.scopes);
    setAddCredentialOpen(false);
    credentialForm.reset();
    loadData();
  };

  const handleRevokeCredential = (id: string) => {
    sageRepo.revokeApiCredential(orgId, id);
    loadData();
  };

  // Webhook Form
  const webhookForm = useForm<CreateWebhookSubscriptionInput>({
    resolver: zodResolver(CreateWebhookSubscriptionSchema),
    defaultValues: {
      url: "",
      events: ["order.delayed", "incident.raised"],
      secret: "whsec_live_default_hmac_secret",
    },
  });

  const onAddWebhook = (data: CreateWebhookSubscriptionInput) => {
    sageRepo.createWebhook(orgId, data);
    setAddWebhookOpen(false);
    webhookForm.reset();
    loadData();
  };

  const handleTestWebhook = (id: string) => {
    const result = sageRepo.triggerTestWebhook(orgId, id);
    setTestWebhookResult(
      `Dispatched mock '${result.event}' event to endpoint. Response: ${result.status} OK (24ms roundtrip)`,
    );
    loadData();
    setTimeout(() => setTestWebhookResult(null), 5000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Integrations & API Ecosystem
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect existing software, configure automated order ingestion, and manage developer API credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddIntegrationOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Connect Integration
          </Button>
        </div>
      </div>

      {/* Integration Capabilities Value Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">
            ⚡
          </span>
          <div>
            <div className="font-bold text-sm">
              Non-Invasive Over-The-Top Architecture
            </div>
            <div className="text-muted-foreground mt-0.5">
              Sage receives orders from your e-commerce storefronts and logistics brokers via webhook or polling, leaving your core storefront code untouched.
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-background font-mono shrink-0">
          Zero Vendor Lock-in
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="integrations" className="gap-2 text-xs">
            <Layers className="h-4 w-4" />
            Connected Platforms ({integrations.length})
          </TabsTrigger>
          <TabsTrigger value="credentials" className="gap-2 text-xs">
            <Key className="h-4 w-4" />
            API Keys & Credentials ({credentials.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2 text-xs">
            <Webhook className="h-4 w-4" />
            Webhook Subscriptions ({webhooks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Platforms Directory */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((item) => (
              <Card key={item.id} className="shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {item.provider}
                    </Badge>
                    <div className="flex items-center space-x-1">
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
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Last Status</span>
                    <span className="text-[11px] font-mono text-emerald-600 truncate max-w-[150px]">
                      {item.lastSyncStatus}
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

        {/* Tab 2: API Keys & Credentials */}
        <TabsContent value="credentials" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Scoped API Credentials
                </CardTitle>
                <CardDescription className="text-xs">
                  Authorize backend services and automated dispatch bots with least-privilege tokens.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setAddCredentialOpen(true)}
                className="gap-1.5 h-8 text-xs"
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
                      <th className="pb-2">Key Prefix</th>
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
                              copyToClipboard(`${cred.keyPrefix}_live_demo_token`, cred.id)
                            }
                            className="p-1 hover:text-foreground text-muted-foreground"
                            title="Copy Token"
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
                              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleRevokeCredential(cred.id)}
                            >
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
        </TabsContent>

        {/* Tab 3: Webhook Subscriptions */}
        <TabsContent value="webhooks" className="space-y-4">
          {testWebhookResult && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{testWebhookResult}</span>
            </div>
          )}

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Outbound Webhook Dispatch
                </CardTitle>
                <CardDescription className="text-xs">
                  Sage delivers cryptographically signed HMAC events to your external systems upon order and fleet triggers.
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
                    className="rounded-lg border border-border p-3 space-y-2 hover:bg-muted/30 transition-colors"
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleTestWebhook(wh.id)}
                        >
                          <Send className="h-3 w-3" /> Test Ping
                        </Button>
                      </div>
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
                      <span>Secret: {wh.secret.slice(0, 10)}••••••••</span>
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

      {/* Modal: Connect New Integration */}
      <Dialog open={addIntegrationOpen} onOpenChange={setAddIntegrationOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={integrationForm.handleSubmit(onAddIntegration)}>
            <DialogHeader>
              <DialogTitle>Connect New Logistics Source</DialogTitle>
              <DialogDescription>
                Configure credentials to sync orders and fleet state automatically.
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
                  <option value="WOOCOMMERCE">WooCommerce B2B</option>
                  <option value="ONFLEET">Onfleet Fleet Manager</option>
                  <option value="SHIPSTATION">ShipStation Logistics</option>
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
                {integrationForm.formState.errors.name && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {integrationForm.formState.errors.name.message}
                  </p>
                )}
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

      {/* Modal: Generate API Key */}
      <Dialog open={addCredentialOpen} onOpenChange={setAddCredentialOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={credentialForm.handleSubmit(onAddCredential)}>
            <DialogHeader>
              <DialogTitle>Generate Scoped API Credential</DialogTitle>
              <DialogDescription>
                Assign least-privilege permissions to this integration key.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <Label htmlFor="credName">Credential Label</Label>
                <Input
                  id="credName"
                  placeholder="e.g. Warehouse Dispatch Automator"
                  className="mt-1"
                  {...credentialForm.register("name")}
                />
                {credentialForm.formState.errors.name && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {credentialForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Allowed Permission Scopes</Label>
                <div className="space-y-2 mt-2 rounded-lg border border-border p-3">
                  {[
                    { id: "orders:read", label: "orders:read - View all orders" },
                    { id: "orders:write", label: "orders:write - Create & assign orders" },
                    { id: "riders:read", label: "riders:read - View fleet telemetry" },
                    { id: "incidents:write", label: "incidents:write - Report incidents" },
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

      {/* Modal: Add Webhook */}
      <Dialog open={addWebhookOpen} onOpenChange={setAddWebhookOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={webhookForm.handleSubmit(onAddWebhook)}>
            <DialogHeader>
              <DialogTitle>Register Webhook Destination</DialogTitle>
              <DialogDescription>
                Receive real-time notifications when order and fleet events fire.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <Label htmlFor="webhookUrl">Webhook Payload URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-api.com/webhooks/sage"
                  className="mt-1"
                  {...webhookForm.register("url")}
                />
                {webhookForm.formState.errors.url && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {webhookForm.formState.errors.url.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Events to Trigger</Label>
                <div className="space-y-2 mt-2 rounded-lg border border-border p-3">
                  {[
                    { id: "order.created", label: "order.created - New order ingested" },
                    { id: "order.delayed", label: "order.delayed - Order delayed past ETA" },
                    { id: "order.delivered", label: "order.delivered - Order completed" },
                    { id: "incident.raised", label: "incident.raised - Incident flagged" },
                  ].map((evt) => (
                    <label key={evt.id} className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        value={evt.id}
                        defaultChecked
                        {...webhookForm.register("events")}
                        className="rounded border-border text-primary"
                      />
                      <span className="font-mono text-[11px]">{evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Signing Secret (HMAC SHA-256)</Label>
                <Input
                  id="secret"
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
              <Button type="submit">Register Webhook</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
