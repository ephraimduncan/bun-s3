import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatFileSize } from "@/lib/utils";
import { ExternalLink, FileIcon, FileText, X } from "lucide-react";
import { useRef, useState } from "react";

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatus, setFileStatus] = useState<
    Record<number, { uploading: boolean; error?: string; result?: any }>
  >({});
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const uploadSingleFile = async (file: File, index: number): Promise<any> => {
    setFileStatus((prev) => ({ ...prev, [index]: { uploading: true } }));

    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setFileStatus((prev) => ({
          ...prev,
          [index]: { uploading: false, result: data.results[0] },
        }));
        return data.results[0];
      }

      throw new Error("No results returned");
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      setFileStatus((prev) => ({
        ...prev,
        [index]: {
          uploading: false,
          error: error instanceof Error ? error.message : "Upload failed",
        },
      }));
      return { originalName: file.name, error: "Upload failed" };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const results = await Promise.all(
        files.map((file, index) => uploadSingleFile(file, index))
      );

      setUploadResults(results);
      setFiles([]);
      setFileStatus({});
    } catch (error) {
      console.error("An error occurred while uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  console.log("uploadResults", uploadResults);

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
                    className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90 overflow-hidden"
                    aria-label="Remove file"
                    disabled={fileStatus[index]?.uploading}
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
                      {fileStatus[index]?.uploading && (
                        <p className="text-xs text-blue-500 mt-1">
                          Uploading...
                        </p>
                      )}
                      {fileStatus[index]?.error && (
                        <p className="text-xs text-destructive mt-1">
                          {fileStatus[index].error}
                        </p>
                      )}
                      {fileStatus[index]?.result && (
                        <p className="text-xs text-green-500 mt-1">
                          Upload complete
                        </p>
                      )}
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
        <Button type="submit" disabled={files.length === 0 || isUploading}>
          {isUploading
            ? "Uploading..."
            : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
        </Button>
      </div>

      {uploadResults.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg text-left font-medium">Upload Results</h3>
          <div className="grid grid-cols-1 gap-4">
            {uploadResults.map((result, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 border-l-4",
                  result.error ? "border-l-destructive" : "border-l-green-500"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1">
                      {result.error ? (
                        <div className="rounded-full bg-destructive/10 p-1">
                          <X className="h-4 w-4 text-destructive" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-green-500/10 p-2">
                          <FileText className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      <p
                        className="font-medium truncate max-w-[200px]"
                        title={result.originalName}
                      >
                        {result.originalName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        result.error
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-500/10 text-green-500"
                      )}
                    >
                      {result.error ? "Failed" : "Success"}
                    </span>
                  </div>

                  {result.error ? (
                    <div className="mt-2 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                      <p className="font-medium">Error:</p>
                      <p>{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{formatFileSize(result.size)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{result.type || "Unknown"}</span>
                      </div>
                      <div className="mt-3">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          View/Download File
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
