import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, X } from "lucide-react";
import { useRef, useState } from "react";

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Files to upload:", files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors",
            "flex flex-col items-center justify-center gap-2"
          )}
          onClick={triggerFileInput}
        >
          <FileText className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drag files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Support for images, documents, and more
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg text-left font-medium">
              Selected Files ({files.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 ">
              {files.map((file, index) => (
                <Card key={index} className="p-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {file.type.startsWith("image/") ? (
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                          <img
                            src={
                              URL.createObjectURL(file) || "/placeholder.svg"
                            }
                            alt={file.name}
                            className="h-full w-full object-cover"
                            onLoad={(e) => {
                              // Clean up object URL after image loads to avoid memory leaks
                              URL.revokeObjectURL(
                                (e.target as HTMLImageElement).src
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                          {file.type.includes("pdf") ? (
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-base font-medium truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {file.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={triggerFileInput}>
          Add More Files
        </Button>
        <Button type="submit" disabled={files.length === 0}>
          Upload {files.length > 0 && `(${files.length})`}
        </Button>
      </div>
    </form>
  );
}
