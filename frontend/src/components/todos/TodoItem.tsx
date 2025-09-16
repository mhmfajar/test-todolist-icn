"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { Todo } from "@/types/todo";

interface Props {
  todo: Todo;
  onUpdate: (text: string) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export default function TodoItem({ todo, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(todo.text);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setValue(todo.text), [todo.text]);

  async function save() {
    const next = value.trim();
    if (!next || next === todo.text) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void save();
    } else if (e.key === "Escape") {
      setValue(todo.text);
      setEditing(false);
    }
  }

  return (
    <li className="flex items-center justify-between rounded border p-2">
      <div className="flex-1">
        {editing ? (
          <Textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
          />
        ) : (
          <span>{todo.text}</span>
        )}
      </div>

      <div className={cn("ml-3 flex flex-col items-center gap-2")}>
        {editing ? (
          <>
            <Button
              className="w-full"
              size="sm"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setValue(todo.text);
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full"
              size="sm"
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
