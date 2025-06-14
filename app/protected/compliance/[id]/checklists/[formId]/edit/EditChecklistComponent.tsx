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
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
    >
      {pending ? "Updating..." : "Update Checklist"}
    </Button>
  );
}

type ChecklistItem = {
  id: string;
  name: string;
  type: 'document' | 'yesno';
  required: boolean;
  category?: string;
};

export default function EditChecklistComponent({ checklist, complianceId }: { checklist: Checklist; complianceId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  
  // Initialize checklist data from existing checklist
  useEffect(() => {
    if (checklist.checklist_schema) {
      setChecklistTitle(checklist.checklist_schema.title || "");
      setChecklistDescription(checklist.checklist_schema.description || "");
      setItems(checklist.checklist_schema.items || []);
    }
  }, [checklist]);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      name: "",
      type: "yesno",
      required: false,
      category: ""
    };
    setItems([...items, newItem]);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, updates: Partial<ChecklistItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    setItems(updatedItems);
  };

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const checklistSchema = {
        title: checklistTitle,
        description: checklistDescription,
        items: items
      };

      // Create FormData with the required fields
      const submitData = new FormData();
      submitData.append("checklist_id", checklist.id);
      submitData.append("checklist_schema", JSON.stringify(checklistSchema));

      const result: ActionResult = await updateChecklist(submitData);
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Checklist updated successfully!");
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
    items: items
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
            </Card>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} className="border border-sky-200 bg-sky-25/10 hover:bg-sky-50/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-sky-900">Item #{index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
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
                          onChange={(e) => updateItem(index, { type: e.target.value as 'document' | 'yesno' })}
                          className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                        >
                          <option value="yesno">Yes/No Question</option>
                          <option value="document">Document Upload</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sky-700 font-medium">Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          placeholder="Enter item name"
                          className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sky-700 font-medium">Category (Optional)</Label>
                        <Input
                          value={item.category || ""}
                          onChange={(e) => updateItem(index, { category: e.target.value })}
                          placeholder="Enter category name"
                          className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                        />
                      </div>                      <div className="flex items-center gap-2 pt-6">
                        <div 
                          onClick={() => updateItem(index, { required: !item.required })}
                          className={`h-4 w-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                            item.required 
                              ? 'bg-sky-600 border-sky-600' 
                              : 'bg-white border-sky-300 hover:border-sky-400'
                          }`}
                        >
                          {item.required && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <Label className="text-sky-700 font-medium cursor-pointer" onClick={() => updateItem(index, { required: !item.required })}>Required</Label>
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
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-sky-900">{item.name || 'Item name'}</p>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              item.type === 'document' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-sky-100 text-sky-800'
                            }`}>
                              {item.type === 'document' ? 'Upload Document' : 'Yes/No'}
                            </span>
                          </div>
                          {item.required && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="text-center py-12 px-6 border-2 border-dashed border-sky-200 rounded-lg bg-sky-50/30">
                  <div className="bg-sky-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-8 w-8 text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-2">No Items Added</h3>
                  <p className="text-sky-600 mb-4">
                    Start building your checklist by adding your first item.
                  </p>
                  <Button 
                    type="button" 
                    onClick={addItem}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              )}

              {items.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button 
                    type="button" 
                    onClick={addItem}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
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
          <SubmitButton />
        </CardFooter>
      </form>
    </>
  );
}
