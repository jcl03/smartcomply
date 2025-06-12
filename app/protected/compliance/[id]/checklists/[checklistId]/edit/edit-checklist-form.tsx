"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckSquare, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";
import { updateChecklist } from "../../../../actions";

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  category?: string;
}

interface ChecklistSchema {
  title?: string;
  description?: string;
  items: ChecklistItem[];
}

interface EditChecklistFormProps {
  complianceId: string;
  checklistId: string;
  frameworkName: string;
  initialChecklist: ChecklistSchema;
}

export default function EditChecklistForm({ 
  complianceId, 
  checklistId, 
  frameworkName, 
  initialChecklist 
}: EditChecklistFormProps) {
  const router = useRouter();
  
  // Initialize state with existing checklist data
  const [title, setTitle] = useState(initialChecklist.title || "");
  const [description, setDescription] = useState(initialChecklist.description || "");
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist.items || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common categories for dropdown
  const commonCategories = [
    "Security", 
    "Risk Management", 
    "Documentation", 
    "Compliance", 
    "Operations", 
    "Training",
    "Monitoring",
    "General"
  ];

  // Generate unique ID for new items
  const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new checklist item
  const addItem = () => {
    const newItem: ChecklistItem = {
      id: generateItemId(),
      text: "",
      required: true,
      category: "General"
    };
    setItems([...items, newItem]);
  };

  // Remove checklist item
  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Update item property
  const updateItem = (itemId: string, property: keyof ChecklistItem, value: any) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [property]: value } : item
    ));
  };

  // Get current schema for preview
  const currentSchema: ChecklistSchema = {
    title: title || "Untitled Checklist",
    description: description || "No description provided",
    items: items.filter(item => item.text.trim() !== "") // Only show items with text
  };

  // Validate form
  const isValid = title.trim() !== "" && items.some(item => item.text.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty items and create final schema
      const finalSchema = {
        title: title.trim(),
        description: description.trim(),
        items: items.filter(item => item.text.trim() !== "")
      };
      
      const formData = new FormData();
      formData.append('checklist_id', checklistId);
      formData.append('checklist_schema', JSON.stringify(finalSchema));
      
      const result = await updateChecklist(formData);
      
      if (result.success) {
        router.push(`/protected/compliance/${complianceId}/checklists`);
      } else {
        console.error('Failed to update checklist:', result.error);
        // Handle error - in a real app, you'd show a toast or error message
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link 
          href={`/protected/compliance/${complianceId}/checklists`}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Checklists
        </Link>
        <CheckSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Edit Checklist #{checklistId} - {frameworkName}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Form Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Checklist</CardTitle>
              <p className="text-sm text-muted-foreground">
                Modify your checklist using the visual editor below.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Checklist Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter checklist title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md resize-none"
                    placeholder="Enter checklist description"
                  />
                </div>
              </div>
              
              {/* Checklist Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Checklist Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-md space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder={`Item ${index + 1} description`}
                          />
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <select
                                value={item.category || "General"}
                                onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                              >
                                {commonCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateItem(item.id, 'required', !item.required)}
                                className="flex items-center gap-1 text-sm"
                              >
                                {item.required ? (
                                  <ToggleRight className="h-4 w-4 text-primary" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                                {item.required ? "Required" : "Optional"}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          disabled={items.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items yet. Click "Add Item" to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is how your updated checklist will appear to users.
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <ChecklistPreview schema={currentSchema} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Checklist"}
          </button>
          <Link
            href={`/protected/compliance/${complianceId}/checklists`}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
