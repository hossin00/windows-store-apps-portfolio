import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File as FileIcon } from "lucide-react";

interface Props {
  onFilesAccepted: (files: File[]) => void;
  className?:      string;
  hint?:           string;
}

export function FileDropZone({ onFilesAccepted, className = "", hint }: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFilesAccepted(accepted);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    // Accept any file type — File Rename Factory does not care about extensions
  });

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        {...getRootProps()}
        className="rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
        style={{
          borderColor: isDragActive ? "#f97316" : "#2d3748",
          background:  isDragActive ? "rgba(249,115,22,.06)" : "rgba(22,27,39,.5)",
        }}
      >
        <input {...getInputProps()} />
        <div
          className="rounded-xl p-3"
          style={{ background: isDragActive ? "rgba(249,115,22,.15)" : "rgba(249,115,22,.08)", color: isDragActive ? "#fb923c" : "#f97316" }}
        >
          <Upload size={24} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#f1f5f9" }}>
            {isDragActive ? "Drop files here" : "Drop files or click to browse"}
          </p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Any file type · multiple files{hint ? ` · ${hint}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
            <FileIcon size={13} /><span>Drag from Explorer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
