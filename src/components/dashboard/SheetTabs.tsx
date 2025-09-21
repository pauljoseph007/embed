import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Check, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DashboardSheet } from '@/store/dashboardStore';
import { toast } from '@/hooks/use-toast';

interface SheetTabsProps {
  sheets: DashboardSheet[];
  currentSheetId: string;
  onSheetChange: (sheetId: string) => void;
  onAddSheet: () => void;
  onDeleteSheet: (sheetId: string) => void;
  onRenameSheet: (sheetId: string, name: string) => void;
  onDuplicateSheet?: (sheetId: string) => void;
  disabled?: boolean;
}

export const SheetTabs = ({
  sheets,
  currentSheetId,
  onSheetChange,
  onAddSheet,
  onDeleteSheet,
  onRenameSheet,
  onDuplicateSheet,
  disabled = false
}: SheetTabsProps) => {
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteSheetId, setDeleteSheetId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSheetId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSheetId]);

  const handleStartEdit = (sheet: DashboardSheet) => {
    if (disabled) return;
    setEditingSheetId(sheet.id);
    setEditingName(sheet.name);
  };

  const handleSaveEdit = () => {
    if (editingSheetId && editingName.trim()) {
      try {
        onRenameSheet(editingSheetId, editingName.trim());
      } catch (error) {
        console.error('Error renaming sheet:', error);
      }
    }
    setEditingSheetId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingSheetId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (sheetId: string) => {
    if (sheets.length <= 1) {
      toast({
        title: "Cannot delete sheet",
        description: "You must have at least one sheet in your dashboard.",
        variant: "destructive"
      });
      return;
    }
    setDeleteSheetId(sheetId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteSheetId) {
      onDeleteSheet(deleteSheetId);
      setDeleteSheetId(null);
      setShowDeleteDialog(false);
      toast({
        title: "Sheet deleted",
        description: "The sheet has been permanently deleted.",
      });
    }
  };

  const handleDuplicate = (sheetId: string) => {
    if (onDuplicateSheet) {
      onDuplicateSheet(sheetId);
      toast({
        title: "Sheet duplicated",
        description: "A copy of the sheet has been created.",
      });
    }
  };

  return (
    <div className="bg-card border-b border-border px-4 py-2 flex-shrink-0">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {sheets.map((sheet) => (
          <motion.div
            key={sheet.id}
            layout
            className="flex items-center gap-1 group"
          >
            {editingSheetId === sheet.id ? (
              <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-6 text-sm border-none shadow-none focus-visible:ring-0 p-0 w-20"
                  autoFocus
                  onBlur={handleSaveEdit}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={handleSaveEdit}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  currentSheetId === sheet.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-foreground'
                }`}
                onClick={() => onSheetChange(sheet.id)}
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  {sheet.name}
                </span>
                
                {!disabled && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-accent-foreground/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(sheet);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-accent-foreground/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(sheet);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename Sheet
                        </DropdownMenuItem>

                        {onDuplicateSheet && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(sheet.id);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Sheet
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(sheet.id);
                          }}
                          disabled={sheets.length <= 1}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Sheet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        
        {!disabled && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAddSheet}
            className="ml-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Sheet
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sheet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sheet? This action cannot be undone and all charts in this sheet will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Sheet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};