"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter your markdown content...",
  className,
  height = 200,
}: MarkdownEditorProps) {
  const [data, setData] = useState(value);

  const handleChange = (val?: string) => {
    const newValue = val || "";
    setData(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("w-full", className)}>
      <MDEditor
        value={data}
        onChange={handleChange}
        data-color-mode="light"
        height={height}
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.5,
          },
        }}
        preview="edit"
        hideToolbar={false}
      />
    </div>
  );
}
