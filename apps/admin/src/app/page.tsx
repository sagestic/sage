"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@sage/ui";

export default function AdminPage() {
  return (
    <div className="bg-background text-foreground min-h-screen antialiased">
      <header className="border-border bg-card border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight">sage admin</span>
            <Badge variant="outline">Admin</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Logs
            </Button>
            <Button size="sm">System Settings</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Administration
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform governance, access controls, and system health.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Backend and services status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">
                  All systems operational
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>PostgreSQL via Prisma 7</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Prisma client connected and ready for queries.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />
      </main>
    </div>
  );
}
