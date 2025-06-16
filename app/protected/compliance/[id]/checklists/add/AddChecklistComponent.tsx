"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, CheckSquare, Sparkles, AlertCircle, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import type { ActionResult } from "@/lib/types";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";

// Submit button with loading state
function SubmitButton({ action }: { action: string }) {
  const { pending } = useFormStatus();
  const isPublish = action === 'publish';
  
  return (
    <div className="relative group">
      <div className={`absolute inset-0 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 ${
        isPublish ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 
        'bg-gradient-to-r from-gray-500 to-gray-600'
      }`}></div>
      <Button 
        type="submit"
        name="action"
        value={action}
        disabled={pending}
        className={`relative text-white transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-bold rounded-xl border border-white/20 backdrop-blur-sm hover:scale-105 transform ${
          isPublish 
            ? 'bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 hover:from-blue-700 hover:via-indigo-800 hover:to-purple-900' 
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
        }`}
      >
        {pending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isPublish ? 'Publishing...' : 'Saving Draft...'}
          </>
        ) : (
          <>
            {isPublish ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Publish Checklist
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}

type ChecklistItem = {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  autoFail?: boolean;
  sectionId: string;
};

type ChecklistSection = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddChecklistComponent({ action, complianceId }: { action: ServerAction; complianceId: string }) {  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [showPreview, setShowPreview] = useState(false);  const addSection = () => {
    const newSection: ChecklistSection = {
      id: `section_${Date.now()}`,
      name: "",
      items: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionIndex: number) => {
    setSections(sections.filter((_, i) => i !== sectionIndex));
  };

  const updateSection = (sectionIndex: number, updates: Partial<ChecklistSection>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
    setSections(updatedSections);
  };

  const addItem = (sectionIndex: number) => {
    const updatedSections = [...sections];
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      name: "",
      type: "document",
      autoFail: false,
      sectionId: updatedSections[sectionIndex].id
    };
    updatedSections[sectionIndex].items.push(newItem);
    setSections(updatedSections);
  };
  
  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items = updatedSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setSections(updatedSections);
  };
  
  const updateItem = (sectionIndex: number, itemIndex: number, updates: Partial<ChecklistItem>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].items[itemIndex] = { 
      ...updatedSections[sectionIndex].items[itemIndex], 
      ...updates 
    };
    setSections(updatedSections);
  };  const handleSubmit = async (formData: FormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");      // Get the action from the clicked button
      const actionType = formData.get("action") as string;
      const status = actionType === "publish" ? "active" : "draft";

      // Create the checklist schema
      const checklistSchema = {
        title: checklistTitle,
        description: checklistDescription,
        sections: sections
      };

      // Add schema and status to form data
      formData.append("checklist_schema", JSON.stringify(checklistSchema));
      formData.append("compliance_id", complianceId);
      formData.append("status", status);

      const result = await action(formData);
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        const successMsg = actionType === "publish" ? "Checklist published successfully!" : "Checklist saved as draft!";
        setSuccessMessage(successMsg);
        // Reset form
        setChecklistTitle("");
        setChecklistDescription("");
        setSections([]);
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the checklist.");
    }
  };  if (showPreview) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-sky-900">Checklist Preview</h2>
          <Button 
            onClick={() => setShowPreview(false)}
            className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </div>
        <ChecklistPreview 
          schema={{
            title: checklistTitle || "Untitled Checklist",
            description: checklistDescription,
            sections: sections
          }}
        />
      </div>
    );
  }return (
    <form action={handleSubmit}>
      <CardContent className="space-y-8 p-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        {errorMessage && (
          <div className="relative p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-800 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-semibold text-lg">{errorMessage}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="relative p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 text-emerald-800 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="font-semibold text-lg">{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Checklist Details Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
          <div className="relative space-y-6 bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Checklist Details
                </h3>
                <p className="text-gray-600 mt-1">Configure your compliance checklist settings and requirements</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-gray-800 font-semibold text-lg">Checklist Title <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    value={checklistTitle}
                    onChange={(e) => setChecklistTitle(e.target.value)}
                    placeholder="e.g., SOX Compliance Checklist, GDPR Data Protection Review"
                    required
                    className="h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-200 bg-white/90 backdrop-blur-sm text-gray-900 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl pointer-events-none"></div>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600">Choose a descriptive name that clearly identifies the compliance checklist</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-800 font-semibold text-lg">Description</Label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={checklistDescription}
                    onChange={(e) => setChecklistDescription(e.target.value)}
                    placeholder="Brief description of what this checklist covers"
                    className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 bg-white/90 backdrop-blur-sm text-gray-900 font-medium shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl resize-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl pointer-events-none"></div>
                </div>
              </div>            </div>
          </div>
        </div>
        
        {/* What happens next? */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-md opacity-75"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  What happens next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Your checklist will be created and ready for use</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">You can add items, categories, and requirements</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Team members can track completion and progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>      {/* Sections Management */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="flex items-center justify-between text-sky-900">
            Checklist Sections
            <Button 
              type="button" 
              onClick={addSection} 
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {sections.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-sky-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-sky-800 mb-2">No Sections Added</h3>
              <p className="text-sky-600 mb-4">
                Start by adding a section to organize your checklist items.
              </p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => (
              <Card key={section.id} className="border border-sky-200 bg-sky-25/10">
                <CardHeader className="bg-sky-50/50 border-b border-sky-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sky-700 font-medium">Section Name *</Label>
                      <Input
                        value={section.name}
                        onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                        placeholder={`Section ${sectionIndex + 1} name`}
                        className="mt-1 bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-sky-700">Items in this section</h4>
                    <Button 
                      type="button" 
                      onClick={() => addItem(sectionIndex)} 
                      variant="outline"
                      size="sm"
                      className="text-sky-600 border-sky-300 hover:bg-sky-50"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  {section.items.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-sky-200 rounded-lg bg-sky-50/30">
                      <p className="text-sky-600 text-sm">No items in this section yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <Card key={item.id} className="border border-sky-200 bg-white">
                          <CardContent className="pt-3 pb-3">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="text-sm font-medium text-sky-900">Item {itemIndex + 1}</h5>
                              <Button
                                type="button"
                                onClick={() => removeItem(sectionIndex, itemIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium text-sm">Item Name *</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateItem(sectionIndex, itemIndex, { name: e.target.value })}
                                  placeholder="Enter item name"
                                  className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium text-sm">Type *</Label>
                                <select
                                  value={item.type}
                                  onChange={(e) => updateItem(sectionIndex, itemIndex, { type: e.target.value as 'document' | 'yesno' })}
                                  className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                                >
                                  <option value="document">Document Upload</option>
                                  <option value="yesno">Yes/No</option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center space-x-2">
                                <div 
                                  onClick={() => updateItem(sectionIndex, itemIndex, { autoFail: !item.autoFail })}
                                  className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    item.autoFail 
                                      ? 'bg-red-600 border-red-600' 
                                      : 'bg-white border-red-300 hover:border-red-400'
                                  }`}
                                >
                                  {item.autoFail && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <Label className="text-red-700 font-medium cursor-pointer text-sm" onClick={() => updateItem(sectionIndex, itemIndex, { autoFail: !item.autoFail })}>
                                  Auto-fail if not completed
                                </Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
      </CardContent>

      <CardFooter className="relative bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 backdrop-blur-lg border-t border-white/50 p-8">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Link href={`/protected/compliance/${complianceId}/checklists`}>
              <Button className="group inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-gray-600 hover:text-gray-800 border border-gray-200 font-semibold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Cancel
              </Button>            </Link>
            <Button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!checklistTitle || sections.length === 0}
              className="group inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-blue-600 hover:text-blue-800 border border-blue-200 font-semibold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
            {/* Action Buttons */}
          <div className="flex gap-3">
            <SubmitButton action="draft" />
            <SubmitButton action="publish" />
          </div>
        </div>
      </CardFooter>
    </form>
  );
}