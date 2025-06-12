"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Plus, Minus, Eye, CheckSquare } from "lucide-react";
import type { ActionResult } from "@/lib/types";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Checklist"}
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

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddChecklistComponent({ action, complianceId }: { action: ServerAction; complianceId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      name: "",
      type: "document",
      required: false,
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

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
    // Remove category from items that use it
    setItems(items.map(item => 
      item.category === categoryToRemove 
        ? { ...item, category: undefined }
        : item
    ));
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Create the checklist schema
      const checklistSchema = {
        title: checklistTitle,
        description: checklistDescription,
        items: items,
        categories: categories
      };

      // Add schema to form data
      formData.append("checklistSchema", JSON.stringify(checklistSchema));
      formData.append("complianceId", complianceId);

      const result = await action(formData);
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Checklist created successfully!");
        // Reset form
        setChecklistTitle("");
        setChecklistDescription("");
        setItems([]);
        setCategories([]);
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the checklist.");
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Checklist Preview</h2>
          <Button 
            onClick={() => setShowPreview(false)}
            variant="outline"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </div>
          <ChecklistPreview 
          schema={{
            title: checklistTitle || "Untitled Checklist",
            description: checklistDescription,
            items: items
          }}
        />
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2" />
            Checklist Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Checklist Title *</Label>
            <Input
              id="title"
              name="title"
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="Enter checklist title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={checklistDescription}
              onChange={(e) => setChecklistDescription(e.target.value)}
              placeholder="Enter checklist description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle>Categories (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
            <Button type="button" onClick={addCategory} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <span className="text-sm">{category}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(category)}
                    className="h-4 w-4 p-0 hover:bg-blue-200"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Checklist Items
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No items added yet. Click "Add Item" to get started.
            </p>
          ) : (
            items.map((item, index) => (
              <Card key={item.id} className="border border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        placeholder="Enter item name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, { type: e.target.value as 'document' | 'yesno' })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="document">Document Upload</option>
                        <option value="yesno">Yes/No Question</option>
                      </select>
                    </div>

                    {categories.length > 0 && (
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          value={item.category || ""}
                          onChange={(e) => updateItem(index, { category: e.target.value || undefined })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">No Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={item.required}
                        onChange={(e) => updateItem(index, { required: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor={`required-${index}`}>Required</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Link href={`/protected/compliance/${complianceId}/checklists`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!checklistTitle || items.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}