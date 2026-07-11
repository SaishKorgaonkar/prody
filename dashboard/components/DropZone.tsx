"use client";

import { useCallback, useState } from "react";

type DropZoneProps = {
  onPath: (path: string) => void;
};

export function DropZone({ onPath }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [localPath, setLocalPath] = useState("");

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onPath(file.name);
      }
    },
    [onPath]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-action-blue bg-action-blue/5"
            : "border-hairline bg-stone/50"
        }`}
      >
        <p className="text-[15px] font-medium text-ink">Drop a project zip</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Or paste a local folder path below (engine intake)
        </p>
      </div>
      <input
        type="text"
        value={localPath}
        onChange={(e) => {
          setLocalPath(e.target.value);
          onPath(e.target.value);
        }}
        placeholder="C:\path\to\your\app or ./demo_app"
        className="w-full rounded-xl border border-hairline bg-canvas px-4 py-3 text-[14px] text-ink outline-none ring-action-blue/30 focus:ring-2"
      />
    </div>
  );
}
