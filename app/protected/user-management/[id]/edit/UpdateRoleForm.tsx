"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { handleUpdateRole } from "./action";

export default function UpdateRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  return (
    <form action={handleUpdateRole}>
      <input type="hidden" name="userId" value={userId} />
      <div className="space-y-4">
        <div>
          <Label htmlFor="role">User Role</Label>          <select
            id="role"
            name="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={currentRole}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <Button type="submit">Update Role</Button>
      </div>
    </form>
  );
}
