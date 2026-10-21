"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from "@sage/ui";
import { formatDate } from "@sage/utils";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen antialiased">
      {/* Header */}
      <header className="border-border bg-card border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight">sage</span>
            <Badge variant="secondary">v0.1.0</Badge>
          </div>
          <div className="text-muted-foreground flex items-center space-x-4 text-sm">
            <span>{formatDate(new Date())}</span>
            <Button variant="outline" size="sm">
              Documentation
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your workspace, resources, and configurations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Next.js Web</CardTitle>
              <CardDescription>Turbopack frontend application</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                App Router with Tailwind CSS and shadcn UI primitives.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Configure Web
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NestJS Backend</CardTitle>
              <CardDescription>Fastify & Prisma database API</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                High-performance API server with type-safe database queries.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                API Docs
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shared UI System</CardTitle>
              <CardDescription>Professional shadcn components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Reusable design primitives shared across Web and Admin.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Primitives
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />

        <div className="max-w-md space-y-4">
          <h2 className="text-lg font-medium">Quick Search</h2>
          <div className="flex space-x-2">
            <Input placeholder="Search components, endpoints, schemas..." />
            <Button>Search</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
