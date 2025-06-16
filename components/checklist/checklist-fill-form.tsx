"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, CheckSquare, Upload, AlertTriangle, FileText } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface Props {
  complianceId: string;
  checklistId: string;
  checklist: any;
  framework: any;
  userProfile: any;
}

type ChecklistItem = {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  autoFail?: boolean;
  sectionId?: string;
};

type ChecklistSection = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

type ChecklistSchema = {
  title: string;
  description: string;
  sections: ChecklistSection[];
};

export function ChecklistFillForm({ complianceId, checklistId, checklist, framework, userProfile }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<ChecklistSchema | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    // Set the schema from the passed checklist data
    if (checklist?.checklist_schema) {
      setSchema(checklist.checklist_schema);
    }
  }, [checklist]);

  const handleInputChange = (itemId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [itemId]: true }));

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("compliance-files")
        .upload(fileName, file);

      if (error) throw error;

      handleInputChange(itemId, {
        fileName: file.name,
        filePath: data.path,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!schema?.sections?.length) {
        throw new Error("No checklist items found");
      }

      // Check if any responses already exist for this user
      const { data: existingResponse } = await supabase
        .from("checklist_responses")
        .select("id")
        .eq("checklist_id", checklistId)
        .eq("user_id", userProfile?.id)
        .single();

      if (existingResponse) {
        throw new Error("You have already submitted a response for this checklist");
      }

      // Validate required fields and auto-fail items
      let hasAutoFailures = false;
      const validationErrors: string[] = [];

      schema.sections.forEach((section) => {
        section.items.forEach((item) => {
          const value = formData[item.id];
          
          // Check if required item is missing
          if (!value) {
            validationErrors.push(`${section.name}: ${item.name} is required`);
          }
          
          // Check auto-fail conditions
          if (item.autoFail && item.type === 'yesno' && value === 'no') {
            hasAutoFailures = true;
          }
          
          if (item.autoFail && item.type === 'document' && !value) {
            hasAutoFailures = true;
          }
        });
      });

      if (validationErrors.length > 0) {
        throw new Error(`Please complete the following items:\n${validationErrors.join('\n')}`);
      }

      // Calculate result
      const result = hasAutoFailures ? "fail" : "pass";

      // Save response
      const { error: responseError } = await supabase
        .from("checklist_responses")
        .insert([
          {
            checklist_id: parseInt(checklistId),
            user_id: userProfile?.id,
            status: "completed",
            result: result,
            title: schema.title,
            response_data: formData,
          },
        ]);

      if (responseError) throw responseError;

      toast({
        title: "Success",
        description: `Checklist submitted successfully! Result: ${result.toUpperCase()}`,
      });

      // Redirect back to compliance view
      window.location.href = `/protected/view-compliance/${complianceId}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit checklist",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  if (!userProfile || !schema || !framework) {
    return (
      <DashboardLayout userProfile={userProfile}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-sky-600">Loading checklist...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <CheckSquare className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sky-900">{schema.title}</h1>
              <p className="text-sky-600 mt-1">{framework.name} • {schema.description}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              Complete Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {schema.sections.map((section, sectionIndex) => (
                <div key={section.id} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-sky-200">
                    <div className="bg-sky-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {sectionIndex + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-sky-900">{section.name}</h3>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-4 ml-11">
                    {section.items.map((item, itemIndex) => (
                      <Card key={item.id} className="border border-sky-200 bg-gradient-to-r from-sky-50/30 to-blue-50/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Item Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-medium text-sky-700">
                                    {sectionIndex + 1}.{itemIndex + 1}
                                  </span>
                                  <h4 className="font-medium text-sky-900">{item.name}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    item.type === 'document' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {item.type === 'document' ? 'Upload Document' : 'Yes/No'}
                                  </span>
                                </div>
                                {item.autoFail && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="text-xs text-red-700 font-medium">
                                      Auto-fail if not completed correctly
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Item Input */}
                            {item.type === "document" && (
                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium">Upload Document</Label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileUpload(e, item.id)}
                                    disabled={uploading[item.id]}
                                    className="w-full p-3 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-colors"
                                  />
                                  {uploading[item.id] && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                                    </div>
                                  )}
                                </div>
                                {formData[item.id] && (
                                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                                    <Upload className="h-4 w-4" />
                                    <span>Uploaded: {formData[item.id].fileName}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.type === "yesno" && (
                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium">Select Option</Label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={item.id}
                                      value="yes"
                                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                                      className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-green-700 font-medium">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={item.id}
                                      value="no"
                                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                                      className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-red-700 font-medium">No</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-sky-200">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="h-5 w-5 mr-2" />
                      Submit Checklist
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
