"use client";

import { SettingsRib } from "../rib";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { DetailRow } from "@/components/detail-row";

export function SettingsView() {
  const vm = SettingsRib.useViewModel();

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Settings"
        description="Manage company details, team access, and spending categories."
      />

      <Tabs value={vm.activeTab} onValueChange={vm.setActiveTab}>
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6 space-y-4">
          <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Company Name" value="Upside Inc." />
            <Separator />
            <DetailRow label="Industry" value="Technology" />
            <Separator />
            <DetailRow label="Plan" value="Business Pro" />
            <Separator />
            <DetailRow label="Billing Email" value="billing@upside.com" />
          </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {vm.teamMembers.length} members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vm.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                          {member.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
          <CardHeader>
            <CardTitle>Spending Categories</CardTitle>
            <CardDescription>
              Categories used for organizing transactions and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Software",
                "Office",
                "Travel",
                "Office Supplies",
                "Meals",
                "Advertising",
                "Education",
                "Marketing",
              ].map((cat) => (
                <Badge key={cat} variant="outline">
                  {cat}
                </Badge>
              ))}
            </div>
          </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

