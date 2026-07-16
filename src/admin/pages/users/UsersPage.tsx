import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">
          Manage user accounts and permissions.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
