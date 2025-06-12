import { Check, X } from "lucide-react";

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

interface ChecklistPreviewProps {
  schema: ChecklistSchema;
  className?: string;
}

export function ChecklistPreview({ schema, className = "" }: ChecklistPreviewProps) {
  // Group items by category if they have categories
  const groupedItems = schema.items?.reduce((acc: any, item: ChecklistItem) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className={`space-y-4 ${className}`}>
      {schema.title && (
        <h3 className="text-lg font-medium">{schema.title}</h3>
      )}
      {schema.description && (
        <p className="text-muted-foreground text-sm">{schema.description}</p>
      )}
      
      {Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-primary border-b pb-1">
                {category}
              </h4>
              <div className="space-y-2">
                {(items as ChecklistItem[]).map((item, index) => (
                  <div 
                    key={item.id || index} 
                    className="flex items-start gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                        {/* Empty checkbox for preview */}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.required ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            <X size={10} />
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
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
        <p className="text-muted-foreground text-sm">No checklist items found</p>
      )}
    </div>
  );
}
