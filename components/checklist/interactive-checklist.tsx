"use client";

import { useState } from "react";
import { Check, X, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface InteractiveChecklistProps {
  schema: ChecklistSchema;
  onComplete?: (completedItems: string[], isAllRequiredComplete: boolean) => void;
  className?: string;
}

export function InteractiveChecklist({ schema, onComplete, className = "" }: InteractiveChecklistProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Group items by category if they have categories
  const groupedItems = schema.items?.reduce((acc: any, item: ChecklistItem) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);

    // Check if all required items are completed
    const requiredItems = schema.items.filter(item => item.required);
    const isAllRequiredComplete = requiredItems.every(item => newCompleted.has(item.id));

    if (onComplete) {
      onComplete(Array.from(newCompleted), isAllRequiredComplete);
    }
  };

  const getProgress = () => {
    const totalItems = schema.items.length;
    const completedCount = completedItems.size;
    return totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  };

  const requiredItems = schema.items.filter(item => item.required);
  const completedRequiredItems = requiredItems.filter(item => completedItems.has(item.id));
  const isAllRequiredComplete = requiredItems.length === completedRequiredItems.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {schema.title || "Checklist"}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {getProgress()}% Complete ({completedItems.size}/{schema.items.length})
          </div>
        </div>
        {schema.description && (
          <p className="text-muted-foreground text-sm">{schema.description}</p>
        )}
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        {/* Required items status */}
        <div className="flex items-center gap-2 text-sm">
          {isAllRequiredComplete ? (
            <span className="flex items-center gap-1 text-green-700">
              <Check size={14} />
              All required items completed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-700">
              <X size={14} />
              {requiredItems.length - completedRequiredItems.length} required items remaining
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-md font-medium text-primary border-b pb-1">
                  {category}
                </h4>
                <div className="space-y-2">
                  {(items as ChecklistItem[]).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-3 p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                          completedItems.has(item.id) 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}>
                          {completedItems.has(item.id) && <Check size={14} />}
                        </div>
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${completedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.required ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              <X size={10} />
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              <Check size={10} />
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No checklist items found</p>
        )}
      </CardContent>
    </Card>
  );
}
