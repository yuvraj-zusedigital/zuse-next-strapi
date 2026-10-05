"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Info, Loader2, Maximize2, Search, Upload } from "lucide-react";
import { listMedia } from "@/app/(cms)/media/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { ACCEPT, SessionExpiredError, uploadFiles } from "@/lib/media";
import type { MediaFile, MediaKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { MediaDetails } from "./media-details";
import { MediaThumb } from "./media-thumb";

const KIND_LABELS: Record<MediaKind, string> = { image: "Images", video: "Videos", audio: "Audio", document: "Documents" };

type Props = {
  /** manage: the /media page. pick: choosing files for a field. */
  mode: "manage" | "pick";
  multiple?: boolean;
  /** Kinds this field accepts; the filter is limited to them. */
  kinds?: MediaKind[];
  accept?: string;
  initialSelection?: MediaFile[];
  onPick?: (files: MediaFile[]) => void;
  onCancel?: () => void;
};

export function MediaLibrary({ mode, multiple = false, kinds, accept = ACCEPT, initialSelection = [], onPick, onCancel }: Props) {
  const allowedKinds = kinds?.length ? kinds : (Object.keys(KIND_LABELS) as MediaKind[]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // "All" is only offered when every kind is allowed; otherwise start on the first allowed kind.
  const showAll = allowedKinds.length === Object.keys(KIND_LABELS).length;
  const [kind, setKind] = useState<MediaKind | "">(showAll ? "" : allowedKinds[0]);
  const [items, setItems] = useState<MediaFile[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  // The search/filter the grid currently shows; differs from `filterKey` while a new one loads.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MediaFile[]>(initialSelection);
  const [details, setDetails] = useState<MediaFile | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const router = useRouter();

  const filterKey = `${debouncedQuery}|${kind}`;
  const loading = loadedKey !== filterKey || loadingMore;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  /** Fetches a page; only the newest request may update the grid. */
  const fetchPage = useCallback(
    (nextPage: number) => {
      const id = ++request.current;
      const key = `${debouncedQuery}|${kind}`;
      return listMedia({ q: debouncedQuery, kind, page: nextPage, pageSize: 40 })
        .then((result) => {
          if (id !== request.current) return;
          setItems((current) => (nextPage === 1 ? result.data : [...current, ...result.data]));
          setPage(result.meta.pagination.page);
          setPageCount(result.meta.pagination.pageCount);
          setTotal(result.meta.pagination.total);
        })
        .catch(() => {
          if (id === request.current) toast.error("Couldn't load the media library.");
        })
        .finally(() => {
          if (id !== request.current) return;
          setLoadedKey(key);
          setLoadingMore(false);
        });
    },
    [debouncedQuery, kind],
  );

  useEffect(() => {
    void fetchPage(1);
  }, [fetchPage]);

  const loadMore = () => {
    setLoadingMore(true);
    void fetchPage(page + 1);
  };

  const isSelected = (file: MediaFile) => selected.some((item) => item.id === file.id);

  const toggle = (file: MediaFile) => {
    if (!multiple) return setSelected(isSelected(file) ? [] : [file]);
    setSelected((current) => (isSelected(file) ? current.filter((item) => item.id !== file.id) : [...current, file]));
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setUploadProgress(0);
    try {
      const uploaded = await uploadFiles(files, setUploadProgress);
      setItems((current) => [...uploaded, ...current]);
      setTotal((current) => current + uploaded.length);
      toast.success(uploaded.length === 1 ? "File uploaded" : `${uploaded.length} files uploaded`);
      if (mode === "pick") setSelected((current) => (multiple ? [...current, ...uploaded] : uploaded.slice(-1)));
    } catch (error) {
      if (error instanceof SessionExpiredError) router.push("/session-expired");
      else toast.error((error as Error).message);
    } finally {
      setUploadProgress(null);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    upload(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className="relative flex min-h-0 flex-col gap-4"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or alt text…"
            className="w-64 pl-8"
            aria-label="Search files"
          />
        </div>
        {allowedKinds.length > 1 && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="File type">
            {(showAll ? ["" as const, ...allowedKinds] : allowedKinds).map((value) => (
              <Button
                key={value || "all"}
                type="button"
                size="sm"
                variant={kind === value ? "secondary" : "ghost"}
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
              >
                {value ? KIND_LABELS[value] : "All"}
              </Button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} files</span>
          <Button type="button" onClick={() => fileInput.current?.click()} disabled={uploadProgress !== null}>
            {uploadProgress !== null ? <Loader2 className="animate-spin" /> : <Upload />} Upload
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={accept}
            multiple
            hidden
            onChange={(event) => {
              upload(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {uploadProgress !== null && (
        <Progress value={Math.round(uploadProgress * 100)} aria-label="Upload progress" />
      )}

      <div className={cn("min-h-0 flex-1", mode === "pick" && "overflow-y-auto")}>
        {!loading && items.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
            <Upload className="size-5" />
            {debouncedQuery ? `Nothing matches “${debouncedQuery}”.` : "No files yet. Drop files here or click Upload."}
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
            {items.map((file) => {
              const active = mode === "pick" && isSelected(file);
              return (
                <li key={file.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => (mode === "pick" ? toggle(file) : setDetails(file))}
                    aria-pressed={mode === "pick" ? active : undefined}
                    className={cn(
                      "block w-full rounded-lg p-1 text-left outline-none ring-offset-2 focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted",
                    )}
                  >
                    <MediaThumb file={file} />
                    <span className="mt-1 block truncate px-0.5 text-xs" title={file.name}>
                      {file.name}
                    </span>
                  </button>
                  {active && (
                    <span className="pointer-events-none absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                  {mode === "pick" && (
                    <span className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button type="button" size="icon-xs" variant="secondary" aria-label={`View ${file.name} larger`} onClick={() => setViewing(items.indexOf(file))}>
                        <Maximize2 />
                      </Button>
                      <Button type="button" size="icon-xs" variant="secondary" aria-label={`Details for ${file.name}`} onClick={() => setDetails(file)}>
                        <Info />
                      </Button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {(loading || page < pageCount) && (
          <div className="flex justify-center py-4">
            <Button type="button" variant="outline" disabled={loading} onClick={loadMore}>
              {loading && <Loader2 className="animate-spin" />} {loading ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>

      {mode === "pick" && (
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <span className="mr-auto text-sm text-muted-foreground">
            {selected.length ? `${selected.length} selected` : multiple ? "Select one or more files" : "Select a file"}
          </span>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onPick?.(selected)}>
            {!multiple ? "Use file" : selected.length === 1 ? "Use 1 file" : `Use ${selected.length} files`}
          </Button>
        </div>
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-background/80 text-sm font-medium">
          Drop to upload
        </div>
      )}

      <MediaDetails
        file={details}
        onClose={() => setDetails(null)}
        onSaved={(file) => {
          setItems((current) => current.map((item) => (item.id === file.id ? file : item)));
          setSelected((current) => current.map((item) => (item.id === file.id ? file : item)));
          setDetails(file);
        }}
        onDeleted={(id) => {
          setItems((current) => current.filter((item) => item.id !== id));
          setSelected((current) => current.filter((item) => item.id !== id));
          setTotal((current) => current - 1);
          setDetails(null);
        }}
      />
      <Lightbox files={items} index={viewing} onIndexChange={setViewing} />
    </div>
  );
}
