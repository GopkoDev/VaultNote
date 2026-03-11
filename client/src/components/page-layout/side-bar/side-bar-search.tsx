import { useState, useRef, useCallback } from "react"
import { filesApi } from "@/api/files"
import type { SearchResult } from "@/types/files"
import { contentTabsStore } from "@/store/content-tabs-store"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FileIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type SearchState = "idle" | "loading" | "done" | "error"

function getFolder(filePath: string): string {
  const parts = filePath.split("/")
  return parts.slice(0, -1).join(" / ")
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>

  const lower = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lower.indexOf(lowerQuery)

  if (idx === -1) return <span>{text}</span>

  return (
    <span>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-sidebar-primary/20 px-0 font-medium text-sidebar-primary not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

export default function SideBarSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [state, setState] = useState<SearchState>("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setState("idle")
      setResults([])
      return
    }

    setState("loading")

    debounceRef.current = setTimeout(async () => {
      const res = await filesApi.search(value.trim())

      if (!res.ok) {
        setState("error")
        setResults([])
        return
      }

      setResults(res.data)
      setState("done")
    }, 350)
  }, [])

  const handleClear = () => {
    setQuery("")
    setResults([])
    setState("idle")
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const openFile = (item: SearchResult) => {
    contentTabsStore.updateTabData({ path: item.path, name: item.name })
  }

  return (
    <SidebarGroup className="flex flex-1 flex-col gap-0 p-0">
      {/* Search input */}
      <div className="px-2 py-2">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes…"
            className="h-8 border-sidebar-border bg-sidebar-accent pr-8 pl-8 text-sm focus-visible:ring-sidebar-primary/50"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {state === "done" && query && (
        <p className="px-3 pb-1 text-xs text-muted-foreground">
          {results.length === 0
            ? "No results"
            : `${results.length} result${results.length === 1 ? "" : "s"}`}
        </p>
      )}

      {/* Content area */}
      <SidebarGroupContent className="flex flex-1 flex-col overflow-y-auto">
        {/* Idle state */}
        {state === "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground">
            <HugeiconsIcon
              icon={Search01Icon}
              size={32}
              strokeWidth={1.5}
              className="opacity-30"
            />
            <p className="text-sm">Type to search notes</p>
          </div>
        )}

        {/* Loading skeletons */}
        {state === "loading" && (
          <div className="flex flex-col gap-1 px-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-md px-2 py-2"
              >
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2 opacity-60" />
                <Skeleton className="h-3 w-full opacity-40" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground">
            <p className="text-sm text-destructive">
              Search failed. Try again.
            </p>
          </div>
        )}

        {/* No results */}
        {state === "done" && results.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground">
            <HugeiconsIcon
              icon={FileIcon}
              size={32}
              strokeWidth={1.5}
              className="opacity-30"
            />
            <p className="text-sm">
              No notes found for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </p>
          </div>
        )}

        {/* Results list */}
        {state === "done" && results.length > 0 && (
          <SidebarMenu className="gap-0 px-2 py-1">
            {results.map((item) => {
              const folder = getFolder(item.path)
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => openFile(item)}
                    className={cn(
                      "h-auto flex-col items-start gap-0.5 px-2 py-2",
                      "hover:bg-sidebar-accent"
                    )}
                  >
                    {/* File name with highlight */}
                    <div className="flex w-full items-center gap-1.5">
                      <HugeiconsIcon
                        icon={FileIcon}
                        size={13}
                        strokeWidth={2}
                        className="shrink-0 text-sidebar-primary"
                      />
                      <span className="truncate text-sm leading-tight font-medium">
                        <HighlightedText
                          text={item.name.replace(/\.md$/, "")}
                          query={item.matchType === "name" ? query : ""}
                        />
                      </span>
                    </div>

                    {/* Folder path */}
                    {folder && (
                      <p className="w-full truncate pl-5 text-xs leading-tight text-muted-foreground">
                        {folder}
                      </p>
                    )}

                    {/* Content snippet */}
                    {item.snippet && (
                      <p className="line-clamp-2 w-full pl-5 text-xs leading-snug whitespace-normal text-muted-foreground">
                        <HighlightedText text={item.snippet} query={query} />
                      </p>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
