"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpCircle } from "lucide-react";

interface Props {
  complianceId: string;
  checklistId: string;
}

export function ChecklistFillForm({ complianceId, checklistId }: Props) {
  const [formData, setFormData] = useState<any>({});
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  useEffect(() => {
    async function loadChecklist() {
      try {
        const { data: checklist, error } = await supabase
          .from("checklist")
          .select("checklist_schema")
          .eq("id", checklistId)
          .single();

        if (error) throw error;
        if (checklist) {
          setSchema(checklist.checklist_schema);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    loadChecklist();
  }, [checklistId]);

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

    try {
      setUploading((prev) => ({ ...prev, [itemId]: true }));

      const fileExt = file.name.split(".").pop();
      const fileName = `${checklistId}/${itemId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("checklist-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("checklist-files")
        .getPublicUrl(fileName);

      handleInputChange(itemId, urlData.publicUrl);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!schema?.items?.length) {
        throw new Error("No checklist items found");
      }

      const { data: existingResponse } = await supabase
        .from("checklist_responses")
        .select("id")
        .eq("checklist_id", checklistId)
        .eq("compliance_id", complianceId)
        .single();

      if (existingResponse) {
        throw new Error("A response for this checklist already exists");
      }

      // Save responses
      const { error: responseError } = await supabase
        .from("checklist_responses")
        .insert([
          {
            checklist_id: checklistId,
            compliance_id: complianceId,
            responses: formData,
          },
        ]);

      if (responseError) throw responseError;

      toast({
        title: "Success",
        description: "Checklist form saved successfully",
      });

      // Redirect back to compliance view
      window.location.href = `/protected/view-compliance/${complianceId}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!schema) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {schema.items?.map((item: any, index: number) => (
        <Card key={item.id} className="bg-white/80 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {index + 1}. {item.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.type === "text" && (
                <div>
                  <Label>Your Answer</Label>
                  <Input
                    type="text"
                    value={formData[item.id] || ""}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    required={item.required}
                    className="mt-1"
                  />
                </div>
              )}

              {item.type === "checkbox" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.id] || false}
                    onCheckedChange={(checked) =>
                      handleInputChange(item.id, checked)
                    }
                    required={item.required}
                  />
                  <Label htmlFor={item.id}>Confirm</Label>
                </div>
              )}

              {item.type === "yesno" && (
                <div>
                  <Label>Select Option</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={item.id}
                        value="yes"
                        checked={formData[item.id] === "yes"}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        required={item.required}
                        className="text-green-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={item.id}
                        value="no"
                        checked={formData[item.id] === "no"}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        required={item.required}
                        className="text-red-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              )}

              {(item.type === "file" || item.type === "document") && (
                <div>
                  <Label>Upload File</Label>
                  <div className="mt-1">
                    {formData[item.id] ? (
                      <div className="flex items-center space-x-4">
                        <a
                          href={formData[item.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Uploaded File
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange(item.id, "")}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Input
                          type="file"
                          onChange={(e) => handleFileUpload(e, item.id)}
                          required={item.required}
                          disabled={uploading[item.id]}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        {uploading[item.id] && (
                          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                            <ArrowUpCircle className="animate-spin h-4 w-4" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Saving..." : "Submit Checklist"}
        </Button>
      </div>
    </form>
  );
}
