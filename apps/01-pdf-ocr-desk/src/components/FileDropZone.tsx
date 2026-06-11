import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, FileText } from "lucide-react";

interface Props {
  onFilesAccepted: (files: File[]) => void;
  multiple?:       boolean;
  maxSizeMB?:      number;
  accept?:         Record<string, string[]>;
  className?:      string;
}

export function FileDropZone({ onFilesAccepted, multiple = false, maxSizeMB = 50, accept, className = "" }: Props) {
  const defaultAccept = {
    "image/png":       [".png"],
    "image/jpeg":      [".jpg", ".jpeg"],
    "image/webp":      [".webp"],
    "application/pdf": [".pdf"],
  };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFilesAccepted(accepted);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept ?? defaultAccept,
    multiple,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        {...getRootProps()}
        className="rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
        style={{
          borderColor: isDragActive ? "#3b82f6" : "#2d3748",
          background:  isDragActive ? "rgba(59,130,246,.06)" : "rgba(22,27,39,.5)",
        }}
      >
        <input {...getInputProps()} />
        <div
          className="rounded-xl p-3"
          style={{ background: isDragActive ? "rgba(59,130,246,.15)" : "rgba(59,130,246,.08)", color: isDragActive ? "#60a5fa" : "#3b82f6" }}
        >
          <Upload size={24} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#f1f5f9" }}>
            {isDragActive ? "Drop files here" : "Drop files or click to browse"}
          </p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            PNG, JPG, JPEG, WebP, PDF · up to {maxSizeMB} MB{multiple ? " · multiple files" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
            <FileImage size={13} /><span>Images</span>
          </div>
          <div style={{ width: 1, height: 12, background: "#2d3748" }} />
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
            <FileText size={13} /><span>PDF files</span>
          </div>
        </div>
      </div>
      {fileRejections.length > 0 && (
        <p className="text-xs px-1" style={{ color: "#ef4444" }}>
          {fileRejections.length} file(s) rejected — check format or size limit.
        </p>
      )}
    </div>
  );
}
