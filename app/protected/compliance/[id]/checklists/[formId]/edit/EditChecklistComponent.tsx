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
    <Button type="submit" disabled={pending}>
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
      <form action={handleSubmit}>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Checklist Metadata */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Checklist Title</Label>
              <Input
                id="title"
                value={checklistTitle}
                onChange={(e) => setChecklistTitle(e.target.value)}
                placeholder="Enter checklist title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={checklistDescription}
                onChange={(e) => setChecklistDescription(e.target.value)}
                placeholder="Enter checklist description"
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="flex justify-between items-center border-t pt-4">
            <h3 className="text-lg font-medium">Checklist Items</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>

          {showPreview ? (
            /* Preview Mode */
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Preview</h4>
              <ChecklistPreview schema={checklistSchema} />
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Item #{index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Minus size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Type</Label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, { type: e.target.value as 'document' | 'yesno' })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="yesno">Yes/No Question</option>
                        <option value="document">Document Upload</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        placeholder="Item name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Category (Optional)</Label>
                      <Input
                        value={item.category || ""}
                        onChange={(e) => updateItem(index, { category: e.target.value })}
                        placeholder="Category name"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={(e) => updateItem(index, { required: e.target.checked })}
                      />
                      <Label>Required</Label>
                    </div>
                  </div>

                  {/* Preview how this item will look */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <Label className="text-xs text-muted-foreground">Preview:</Label>
                    <div className="flex items-start gap-3 mt-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {item.type === 'document' ? (
                          <Upload className="w-4 h-4 text-green-600" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{item.name || 'Item name'}</p>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            item.type === 'document' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.type === 'document' ? 'Upload Document' : 'Yes/No'}
                          </span>
                        </div>
                        {item.required && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground mb-4">No items added yet</p>
                  <Button type="button" onClick={addItem}>
                    <Plus size={16} className="mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              )}

              {items.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button type="button" onClick={addItem} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Link 
            href={`/protected/compliance/${complianceId}/checklists`}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <SubmitButton />
        </CardFooter>
      </form>
    </>
  );
}
