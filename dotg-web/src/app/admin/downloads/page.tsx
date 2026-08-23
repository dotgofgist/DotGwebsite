"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const DOWNLOADS_BUCKET = "downloads";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type DownloadFile = {
  id: string | null;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileSize(metadata: Record<string, unknown> | null) {
  const size = metadata?.size;
  return typeof size === "number" ? size : 0;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminDownloadsPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.storage.from(DOWNLOADS_BUCKET).list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      setMessage(`파일 목록을 불러오지 못했습니다: ${error.message}`);
      setFiles([]);
    } else {
      setFiles((data ?? []).filter((file) => file.name !== ".emptyFolderPlaceholder"));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("업로드할 파일을 선택해주세요.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage("파일 크기는 100MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setUploading(true);
    setMessage(null);

    const { error } = await supabase.storage
      .from(DOWNLOADS_BUCKET)
      .upload(selectedFile.name, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type || undefined,
      });

    if (error) {
      setMessage(
        error.message.toLowerCase().includes("already exists")
          ? "같은 이름의 파일이 이미 존재합니다. 파일명을 바꾼 뒤 다시 업로드해주세요."
          : `업로드에 실패했습니다: ${error.message}`,
      );
      setUploading(false);
      return;
    }

    setSelectedFile(null);
    setMessage("업로드가 완료되었습니다.");
    setUploading(false);
    await loadFiles();
  }

  async function handleDelete(name: string) {
    if (!window.confirm(`\"${name}\" 파일을 삭제할까요?`)) return;

    setMessage(null);
    const { error } = await supabase.storage.from(DOWNLOADS_BUCKET).remove([name]);

    if (error) {
      setMessage(`삭제에 실패했습니다: ${error.message}`);
      return;
    }

    setMessage("파일을 삭제했습니다.");
    await loadFiles();
  }

  async function handleDownload(name: string) {
    const { data, error } = await supabase.storage.from(DOWNLOADS_BUCKET).download(name);

    if (error) {
      setMessage(`다운로드에 실패했습니다: ${error.message}`);
      return;
    }

    const url = URL.createObjectURL(data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">파일 관리</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">자료실 관리</h1>
        <p className="mt-2 text-sm text-neutral-400">
          공개 자료실에 노출할 파일을 업로드하거나 삭제할 수 있습니다.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">새 파일 업로드</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <button
            className="min-h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedFile || uploading}
            onClick={() => void handleUpload()}
            type="button"
          >
            {uploading ? "업로드 중..." : "업로드"}
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-400">최대 파일 크기: 100MB</p>
      </section>

      {message ? (
        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm">{message}</div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold">업로드된 파일</h2>
          <button
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-background"
            onClick={() => void loadFiles()}
            type="button"
          >
            새로고침
          </button>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-sm text-neutral-400">파일 목록을 불러오는 중...</p>
        ) : files.length === 0 ? (
          <p className="px-6 py-10 text-sm text-neutral-400">업로드된 파일이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-background text-xs text-neutral-400">
                <tr>
                  <th className="px-6 py-3 font-medium">파일명</th>
                  <th className="px-6 py-3 font-medium">크기</th>
                  <th className="px-6 py-3 font-medium">업로드 시각</th>
                  <th className="px-6 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((file) => (
                  <tr key={file.id ?? file.name}>
                    <td className="max-w-md truncate px-6 py-4 font-medium">{file.name}</td>
                    <td className="px-6 py-4 text-neutral-400">{formatBytes(getFileSize(file.metadata))}</td>
                    <td className="px-6 py-4 text-neutral-400">{formatDate(file.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-border px-3 py-2 text-xs hover:bg-background"
                          onClick={() => void handleDownload(file.name)}
                          type="button"
                        >
                          다운로드
                        </button>
                        <button
                          className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                          onClick={() => void handleDelete(file.name)}
                          type="button"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
