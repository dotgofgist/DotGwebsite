"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Container } from "@/components/ui/container";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const DOWNLOADS_BUCKET = "downloads";

type DownloadFile = {
  id: string | null;
  name: string;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileSize(metadata: Record<string, unknown> | null) {
  const size = metadata?.size;
  return typeof size === "number" ? size : 0;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));
}

export default function DownloadsPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.storage.from(DOWNLOADS_BUCKET).list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      setErrorMessage("자료 목록을 불러오지 못했습니다.");
      setFiles([]);
    } else {
      setFiles((data ?? []).filter((file) => file.name !== ".emptyFolderPlaceholder"));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  async function handleDownload(name: string) {
    setDownloading(name);
    setErrorMessage(null);

    const { data, error } = await supabase.storage.from(DOWNLOADS_BUCKET).download(name);

    if (error) {
      setErrorMessage("파일을 다운로드하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setDownloading(null);
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
    setDownloading(null);
  }

  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Downloads</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">자료실</h1>
          <p className="mt-4 leading-7 text-neutral-400">
            DotG에서 공유하는 프로젝트 자료와 파일을 내려받을 수 있습니다.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-md border border-border bg-surface px-4 py-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-xl border border-border bg-surface">
          {loading ? (
            <p className="px-6 py-12 text-sm text-neutral-400">자료를 불러오는 중...</p>
          ) : files.length === 0 ? (
            <p className="px-6 py-12 text-sm text-neutral-400">현재 등록된 자료가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((file) => (
                <li className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={file.id ?? file.name}>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {formatBytes(getFileSize(file.metadata))} · {formatDate(file.created_at)}
                    </p>
                  </div>
                  <button
                    className="min-h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={downloading === file.name}
                    onClick={() => void handleDownload(file.name)}
                    type="button"
                  >
                    {downloading === file.name ? "다운로드 중..." : "다운로드"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}
