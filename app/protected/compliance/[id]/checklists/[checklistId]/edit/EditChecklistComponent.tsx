"use client";

import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, CheckSquare, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateChecklist } from "../../../../actions";
import type { ActionResult } from "@/lib/types";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";

// Checklist interface definition
interface Checklist {
  id: string;
  compliance_id: string;
  checklist_schema: any;
  created_at: string;
  status: string;
}

// Submit button with loading state
function SubmitButton({ action }: { action: string }) {
  const { pending } = useFormStatus();
  const isPublish = action === 'publish';
  const isDraft = action === 'draft';
  const isUpdate = action === 'update';
  
  return (
    <Button 
      type="submit"
      name="action"
      value={action}
      disabled={pending}
      className={`text-white transition-all duration-200 shadow-md hover:shadow-lg ${
        isPublish 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
          : isDraft
          ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
      }`}
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {isPublish ? 'Publishing...' : isDraft ? 'Saving Draft...' : 'Updating...'}
        </>
      ) : (
        <>
          {isPublish ? 'Publish Checklist' : isDraft ? 'Save as Draft' : 'Update Checklist'}
        </>
      )}
    </Button>
  );
}

type ChecklistItem = {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  autoFail?: boolean;
};

type ChecklistSection = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

export default function EditChecklistComponent({ 
  checklist, 
  complianceId, 
  hasResponses = false 
}: { 
  checklist: Checklist; 
  complianceId: string; 
  hasResponses?: boolean;
}) {  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(checklist.status || "draft");
  const router = useRouter();

  // Initialize checklist data from existing checklist
  useEffect(() => {
    if (checklist.checklist_schema) {
      setChecklistTitle(checklist.checklist_schema.title || "");
      setChecklistDescription(checklist.checklist_schema.description || "");
      
      // Handle both new (sections) and old (items) format
      if (checklist.checklist_schema.sections) {
        // New format with sections
        setSections(checklist.checklist_schema.sections);
      } else if (checklist.checklist_schema.items) {
        // Old format with items - convert to sections
        const items = checklist.checklist_schema.items.map((item: any) => ({
          id: item.id || `item_${Date.now()}_${Math.random()}`,
          name: item.name || "",
          type: item.type || 'document',
          autoFail: item.autoFail || false,
          sectionId: 'general'
        }));
        
        setSections([{
          id: 'general',
          name: 'General',
          items: items
        }]);
      }
    }
  }, [checklist]);  const addSection = () => {
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
      autoFail: false
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Get the action from the clicked button
      const actionType = formData.get("action") as string;
      let status = currentStatus; // Keep current status by default
      
      // Update status based on action
      if (actionType === "publish") {
        status = "active";
      } else if (actionType === "draft") {
        status = "draft";
      }
      // For "update" action, keep the current status

      const checklistSchema = {
        title: checklistTitle,
        description: checklistDescription,
        sections: sections
      };

      // Create FormData with the required fields
      const submitData = new FormData();
      submitData.append("checklist_id", checklist.id);
      submitData.append("checklist_schema", JSON.stringify(checklistSchema));
      submitData.append("status", status);

      const result: ActionResult = await updateChecklist(submitData);
        if (result.error) {
        setErrorMessage(result.error);
      } else {
        // Update current status if it changed
        setCurrentStatus(status);
        
        const successMsg = actionType === "publish" ? "Checklist published successfully!" : 
                          actionType === "draft" ? "Checklist saved as draft!" : 
                          "Checklist updated successfully!";
        setSuccessMessage(successMsg);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/protected/compliance/${complianceId}/checklists`);
        }, 1500);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    }
  };
  const checklistSchema = {
    title: checklistTitle,
    description: checklistDescription,
    sections: sections
  };

  return (
    <>
      <form action={handleSubmit}>        <CardContent className="space-y-6 p-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-sky-600" />
              <span className="text-sky-900 font-medium">Current Status:</span>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              currentStatus === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
              currentStatus === 'draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {currentStatus === 'active' ? 'Published' : 
               currentStatus === 'draft' ? 'Draft' : 
               'Archived'}
            </span>
          </div>

          {/* Checklist Metadata */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
              <CardTitle className="flex items-center text-sky-900">
                <CheckSquare className="h-5 w-5 mr-2 text-sky-600" />
                Checklist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sky-700 font-medium">Checklist Title *</Label>
                <Input
                  id="title"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                  placeholder="Enter checklist title"
                  className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sky-700 font-medium">Description</Label>
                <textarea
                  id="description"
                  value={checklistDescription}
                  onChange={(e) => setChecklistDescription(e.target.value)}
                  placeholder="Enter checklist description"
                  className="w-full p-3 bg-white border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Toggle */}
          <div className="flex justify-between items-center p-4 bg-sky-50 rounded-lg border border-sky-200">
            <h3 className="text-lg font-semibold text-sky-900">Checklist Items</h3>
            <Button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>          {showPreview ? (
            /* Preview Mode */
            <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
                <CardTitle className="flex items-center text-sky-900">
                  <Eye className="h-5 w-5 mr-2 text-sky-600" />
                  Checklist Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChecklistPreview schema={checklistSchema} />
              </CardContent>
            </Card>          ) : (
            /* Edit Mode - Section-based structure */
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <Card key={section.id} className="border border-sky-200 bg-gradient-to-r from-sky-50/50 to-blue-50/50">
                  <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-100 border-b border-sky-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-sky-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {sectionIndex + 1}
                        </div>
                        <Input
                          value={section.name}
                          onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                          placeholder="Enter section name"
                          className="font-semibold text-sky-900 bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-sky-200"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <Card key={item.id} className="border border-sky-200 bg-white/60 hover:bg-white/80 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-sky-900">Item #{itemIndex + 1}</h4>
                              <Button
                                type="button"
                                onClick={() => removeItem(sectionIndex, itemIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium">Item Type *</Label>
                                <select
                                  value={item.type}
                                  onChange={(e) => updateItem(sectionIndex, itemIndex, { type: e.target.value as 'document' | 'yesno' })}
                                  className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                                >
                                  <option value="document">Document Upload</option>
                                  <option value="yesno">Yes/No</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sky-700 font-medium">Item Name *</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateItem(sectionIndex, itemIndex, { name: e.target.value })}
                                  placeholder="Enter item name"
                                  className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  onClick={() => updateItem(sectionIndex, itemIndex, { autoFail: !item.autoFail })}
                                  className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    item.autoFail 
                                      ? 'bg-red-600 border-red-600' 
                                      : 'bg-white border-sky-300 hover:border-sky-400'
                                  }`}
                                >
                                  {item.autoFail && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <Label className="text-sky-700 font-medium cursor-pointer" onClick={() => updateItem(sectionIndex, itemIndex, { autoFail: !item.autoFail })}>
                                  Auto-fail if not completed
                                </Label>
                              </div>
                            </div>

                            {/* Preview how this item will look */}
                            <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
                              <Label className="text-xs text-sky-600 font-medium">Preview:</Label>
                              <div className="flex items-start gap-3 mt-2">
                                <div className="flex-shrink-0 mt-0.5">
                                  {item.type === 'document' ? (
                                    <Upload className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <CheckSquare className="w-4 h-4 text-purple-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-sky-900">{item.name || 'Item name'}</p>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      item.type === 'document' ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {item.type === 'document' ? 'Upload Document' : 'Yes/No'}
                                    </span>
                                  </div>
                                  {item.autoFail && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium mt-2">
                                      Auto-fail
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Add Item Button */}
                      <div className="flex justify-center pt-2">
                        <Button 
                          type="button" 
                          onClick={() => addItem(sectionIndex)}
                          variant="outline"
                          className="border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* No Sections State */}
              {sections.length === 0 && (
                <div className="text-center py-12 px-6 border-2 border-dashed border-sky-200 rounded-lg bg-sky-50/30">
                  <div className="bg-sky-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-8 w-8 text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-2">No Sections Added</h3>
                  <p className="text-sky-600 mb-4">
                    Start building your checklist by adding your first section.
                  </p>
                  <Button 
                    type="button" 
                    onClick={addSection}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Section
                  </Button>
                </div>
              )}

              {/* Add Section Button */}
              {sections.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button 
                    type="button" 
                    onClick={addSection}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>        <CardFooter className="flex justify-between pt-6 border-t border-sky-100">
          <Link 
            href={`/protected/compliance/${complianceId}/checklists`}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
          >
            Cancel
          </Link>
            {/* Action buttons based on current status and responses */}
          <div className="flex gap-3">
            {currentStatus !== "active" && <SubmitButton action="publish" />}
            {(currentStatus === "draft" || (currentStatus === "active" && !hasResponses)) && <SubmitButton action="draft" />}
            <SubmitButton action="update" />
          </div>
        </CardFooter>
      </form>
    </>
  );
}
