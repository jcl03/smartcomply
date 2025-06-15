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
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
    >
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
      };      // Add schema to form data
      formData.append("checklist_schema", JSON.stringify(checklistSchema));
      formData.append("compliance_id", complianceId);

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
            items: items
          }}
        />
      </div>
    );
  }
  return (
    <form action={handleSubmit} className="space-y-6 p-6">
      {/* Main Details Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="flex items-center text-sky-900">
            <CheckSquare className="h-5 w-5 mr-2 text-sky-600" />
            Checklist Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}          <div className="space-y-2">
            <Label htmlFor="title" className="text-sky-700 font-medium">Checklist Title *</Label>
            <Input
              id="title"
              name="title"
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="Enter checklist title"
              required
              className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sky-700 font-medium">Description</Label>
            <Input
              id="description"
              name="description"
              value={checklistDescription}
              onChange={(e) => setChecklistDescription(e.target.value)}
              placeholder="Enter checklist description"
              className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="text-sky-900">Categories (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
            />
            <Button 
              type="button" 
              onClick={addCategory} 
              className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-1 bg-sky-100 text-sky-800 px-3 py-1.5 rounded-lg border border-sky-200">
                  <span className="text-sm font-medium">{category}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(category)}
                    className="h-4 w-4 p-0 hover:bg-sky-200 text-sky-600"
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
      <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
          <CardTitle className="flex items-center justify-between text-sky-900">
            Checklist Items
            <Button 
              type="button" 
              onClick={addItem} 
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {items.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-sky-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-sky-800 mb-2">No Items Added</h3>
              <p className="text-sky-600 mb-4">
                No items added yet. Click "Add Item" to get started.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <Card key={item.id} className="border border-sky-200 bg-sky-25/10 hover:bg-sky-50/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-sky-900">Item {index + 1}</h4>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    <div className="space-y-2">
                      <Label className="text-sky-700 font-medium">Item Name *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        placeholder="Enter item name"
                        required
                        className="bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-200 text-sky-900 placeholder:text-sky-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sky-700 font-medium">Type *</Label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, { type: e.target.value as 'document' | 'yesno' })}
                        className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                      >
                        <option value="document">Document Upload</option>
                        <option value="yesno">Yes/No Question</option>
                      </select>
                    </div>                    {categories.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sky-700 font-medium">Category</Label>
                        <select
                          value={item.category || ""}
                          onChange={(e) => updateItem(index, { category: e.target.value || undefined })}
                          className="w-full p-2 bg-white border border-sky-200 rounded-md focus:border-sky-400 focus:ring-sky-200 text-sky-900"
                        >
                          <option value="">No Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}                    <div className="flex items-center space-x-2">
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
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <CardFooter className="flex justify-between pt-6">
        <div className="flex gap-3">
          <Link href={`/protected/compliance/${complianceId}/checklists`}>
            <Button className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!checklistTitle || items.length === 0}
            className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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