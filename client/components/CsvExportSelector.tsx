import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableColumns: { key: string; label?: string }[];
  defaultSelected?: string[];
  onExport: (columns: string[]) => void;
}

export default function CsvExportSelector({ open, onOpenChange, availableColumns, defaultSelected = [], onExport }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const toggle = (key: string) => {
    if (selected.includes(key)) setSelected(selected.filter((s) => s !== key));
    else setSelected([...selected, key]);
  };

  const selectAll = () => setSelected(availableColumns.map((c) => c.key));
  const clearAll = () => setSelected([]);

  const doExport = () => {
    onExport(selected.length ? selected : availableColumns.map((c) => c.key));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select columns to export</DialogTitle>
          <DialogDescription>Choose which columns to include in the CSV export.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-auto py-2">
          <div className="flex gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>Select all</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
          </div>
          {availableColumns.map((col) => (
            <label key={col.key} className="flex items-center gap-2">
              <Checkbox checked={selected.includes(col.key)} onCheckedChange={() => toggle(col.key)} />
              <span className="text-sm">{col.label || col.key}</span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={doExport}>Export</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
