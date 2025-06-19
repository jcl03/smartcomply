"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function NewChecklistPage() {
  const [compliances, setCompliances] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchCompliances = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("compliance")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (!error && data) setCompliances(data);
    };
    fetchCompliances();
  }, []);

  useEffect(() => {
    if (selectedCompliance) {
      const fetchChecklists = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("checklist")
          .select("id, title")
          .eq("compliance_id", selectedCompliance)
          .order("title");
        if (!error && data) setChecklists(data);
      };
      fetchChecklists();
    }
  }, [selectedCompliance]);

  const handleSelectCompliance = (complianceId: string) => {
    router.push(`/protected/compliance/${complianceId}/checklists`);
  };

  const handleSelectChecklist = (checklistId: string) => {
    router.push(`/protected/checklist/${checklistId}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/protected"
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-sky-200 hover:bg-sky-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-sky-600" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-sky-900 flex items-center gap-3">
              <CheckSquare className="h-6 w-6 lg:h-8 lg:w-8 text-sky-600" />
              Create Checklist
            </h1>
            <p className="text-sky-600 mt-1">
              Select a compliance framework to add a checklist to
            </p>
          </div>
        </div>

        {/* Compliance Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-sky-900">
              Select Compliance Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {compliances.map((compliance) => (
                <Button
                  key={compliance.id}
                  variant="outline"
                  className="block w-full text-left p-4 rounded-lg border border-sky-200 hover:bg-sky-50 transition-all duration-200 hover:shadow-md"
                  onClick={() => handleSelectCompliance(compliance.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sky-900">
                        {compliance.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sky-600">
                      <CheckSquare className="h-5 w-5" />
                      <span className="text-sm font-medium">Select</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist Selection */}
        {selectedCompliance && (
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-sky-900">Select Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {checklists.map((checklist) => (
                  <Button
                    key={checklist.id}
                    variant="outline"
                    className="block w-full text-left p-4 rounded-lg border border-sky-200 hover:bg-sky-50 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSelectChecklist(checklist.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sky-900">
                          {checklist.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sky-600">
                        <CheckSquare className="h-5 w-5" />
                        <span className="text-sm font-medium">Select</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
