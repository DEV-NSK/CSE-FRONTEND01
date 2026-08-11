import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Upload,
  Archive,
  FileCheck,
  Undo2,
  CheckCircle2,
  Clock,
  FileX,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  useAdminLearningContent,
  useAdminLearningLevels,
  usePublishLearningContent,
  useUnpublishLearningContent,
  useArchiveLearningContent,
  useDeleteLearningContent,
  useBulkUpdateContentStatus,
  useBulkDeleteContent,
} from "@/shared/hooks/useAdminLearning";
import type { LearningContentStatus } from "@/shared/types/learning-cms";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/feedback/Skeleton";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils";

const STATUS_FILTERS: Array<{
  label: string;
  value: LearningContentStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Unpublished", value: "UNPUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

function StatusBadge({ status }: { status: LearningContentStatus }) {
  const config: Record<
    LearningContentStatus,
    { label: string; cls: string; icon: React.ElementType }
  > = {
    PUBLISHED: {
      label: "Published",
      cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
    },
    DRAFT: {
      label: "Draft",
      cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      icon: Clock,
    },
    UNPUBLISHED: {
      label: "Unpublished",
      cls: "bg-slate-500/15 text-slate-400 border-slate-500/20",
      icon: Undo2,
    },
    ARCHIVED: {
      label: "Archived",
      cls: "bg-red-500/15 text-red-400 border-red-500/20",
      icon: FileX,
    },
  };
  const cfg = config[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1.5 border", cfg.cls)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

export default function AdminLearningContentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    LearningContentStatus | "ALL"
  >("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action:
      | "publish"
      | "unpublish"
      | "archive"
      | "delete"
      | "bulk-publish"
      | "bulk-archive"
      | "bulk-delete";
    id?: string;
    ids?: string[];
  }>({ open: false, action: "delete" });

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter,
      levelId: levelFilter === "ALL" ? undefined : levelFilter,
      page: 1,
      limit: 50,
    }),
    [search, statusFilter, levelFilter],
  );

  const {
    data: list,
    isLoading,
    error,
    refetch,
  } = useAdminLearningContent(filters);
  const { data: levels } = useAdminLearningLevels({ includeInactive: true });
  const publishMutation = usePublishLearningContent();
  const unpublishMutation = useUnpublishLearningContent();
  const archiveMutation = useArchiveLearningContent();
  const deleteMutation = useDeleteLearningContent();
  const bulkStatusMutation = useBulkUpdateContentStatus();
  const bulkDeleteMutation = useBulkDeleteContent();

  const rows = list?.data ?? [];

  const allSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    try {
      const { action, id, ids } = confirmDialog;
      if (action === "publish" && id) {
        await publishMutation.mutateAsync(id);
        toast({ title: "Content published", variant: "success" });
      } else if (action === "unpublish" && id) {
        await unpublishMutation.mutateAsync(id);
        toast({ title: "Content unpublished", variant: "success" });
      } else if (action === "archive" && id) {
        await archiveMutation.mutateAsync(id);
        toast({ title: "Content archived", variant: "success" });
      } else if (action === "delete" && id) {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Content deleted", variant: "success" });
      } else if (action === "bulk-publish" && ids?.length) {
        await bulkStatusMutation.mutateAsync({ ids, status: "PUBLISHED" });
        toast({ title: `${ids.length} items published`, variant: "success" });
        setSelectedIds(new Set());
      } else if (action === "bulk-archive" && ids?.length) {
        await bulkStatusMutation.mutateAsync({ ids, status: "ARCHIVED" });
        toast({ title: `${ids.length} items archived`, variant: "success" });
        setSelectedIds(new Set());
      } else if (action === "bulk-delete" && ids?.length) {
        await bulkDeleteMutation.mutateAsync(ids);
        toast({ title: `${ids.length} items deleted`, variant: "success" });
        setSelectedIds(new Set());
      }
      refetch();
    } catch {
      toast({ title: "Operation failed", variant: "error" });
    } finally {
      setConfirmDialog({ open: false, action: "delete" });
    }
  };

  const openBulkDialog = (
    action: "bulk-publish" | "bulk-archive" | "bulk-delete",
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast({ title: "Select items first", variant: "warning" });
      return;
    }
    setConfirmDialog({ open: true, action, ids });
  };

  return (
    <div
      className="space-y-5 text-slate-200"
      role="main"
      aria-label="Learning Content Management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Learning Content</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage daily learning content — create, edit, publish, archive.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/learning/create")}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">Failed to load content.</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic..."
            className="pl-8 bg-slate-900 border-slate-800 text-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as LearningContentStatus | "ALL")
          }
        >
          <SelectTrigger className="w-[150px] bg-slate-900 border-slate-800 text-sm gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-sm gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            {levels?.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                Level {String(l.levelNumber ?? 0).padStart(2, "0")} — {l.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-1.5 ml-auto bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1">
            <span className="text-xs text-slate-400 mr-1">
              {selectedIds.size} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-emerald-400"
              onClick={() => openBulkDialog("bulk-publish")}
            >
              <FileCheck className="w-3 h-3" /> Publish
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-amber-400"
              onClick={() => openBulkDialog("bulk-archive")}
            >
              <Archive className="w-3 h-3" /> Archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-400"
              onClick={() => openBulkDialog("bulk-delete")}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-800">
                <TableHead className="w-10 py-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="w-16 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Day
                </TableHead>
                <TableHead className="w-20 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Level
                </TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase">
                  Topic
                </TableHead>
                <TableHead className="w-20 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Reel
                </TableHead>
                <TableHead className="w-20 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Notes
                </TableHead>
                <TableHead className="w-24 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </TableHead>
                <TableHead className="w-36 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Published
                </TableHead>
                <TableHead className="w-16 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12">
                    <EmptyState
                      icon={BookOpen}
                      title="No learning content yet"
                      description="Create your first daily learning content to get started."
                      action={
                        <Button
                          onClick={() => navigate("/admin/learning/create")}
                          className="gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Create Content
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-slate-800 hover:bg-slate-800/30"
                  >
                    <TableCell className="py-3">
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={() => toggleOne(row.id)}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-sm font-mono text-slate-400">
                      {String(row.dayNumber ?? 0).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-3 text-sm font-mono text-slate-400">
                      L{String(row.levelNumber ?? 0).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm font-medium text-slate-200">
                        {row.topicName}
                      </p>
                      {row.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {row.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {row.reelUrl ? (
                        <a
                          href={row.reelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"
                        >
                          <Upload className="w-3 h-3" /> Reel
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-slate-400 font-mono">
                        {row.notes?.length ?? 0}/5
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="py-3 text-xs text-slate-500">
                      {row.publishedAt
                        ? new Date(row.publishedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 bg-slate-900 border-slate-700"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/learning/${row.id}`)
                            }
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/learning/${row.id}/edit`)
                            }
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          {row.status !== "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: "publish",
                                  id: row.id,
                                })
                              }
                              className="text-xs text-emerald-400 cursor-pointer gap-2"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Publish
                            </DropdownMenuItem>
                          )}
                          {row.status === "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: "unpublish",
                                  id: row.id,
                                })
                              }
                              className="text-xs text-amber-400 cursor-pointer gap-2"
                            >
                              <Undo2 className="w-3.5 h-3.5" /> Unpublish
                            </DropdownMenuItem>
                          )}
                          {row.status !== "ARCHIVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: "archive",
                                  id: row.id,
                                })
                              }
                              className="text-xs text-amber-400 cursor-pointer gap-2"
                            >
                              <Archive className="w-3.5 h-3.5" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: "delete",
                                id: row.id,
                              })
                            }
                            className="text-xs text-red-400 cursor-pointer gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(o) =>
          !o && setConfirmDialog({ open: false, action: "delete" })
        }
      >
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {confirmDialog.action === "publish" && "Publish Content?"}
              {confirmDialog.action === "unpublish" && "Unpublish Content?"}
              {confirmDialog.action === "archive" && "Archive Content?"}
              {confirmDialog.action === "delete" && "Delete Content?"}
              {confirmDialog.action === "bulk-publish" &&
                `Publish ${confirmDialog.ids?.length} items?`}
              {confirmDialog.action === "bulk-archive" &&
                `Archive ${confirmDialog.ids?.length} items?`}
              {confirmDialog.action === "bulk-delete" &&
                `Delete ${confirmDialog.ids?.length} items?`}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              {confirmDialog.action === "publish" &&
                "This content will become visible to students immediately."}
              {confirmDialog.action === "unpublish" &&
                "This content will be hidden from students."}
              {confirmDialog.action === "archive" &&
                "This content will be archived and no longer part of the active roadmap."}
              {confirmDialog.action === "delete" &&
                "This action is destructive. Student progress records will be preserved via soft delete."}
              {confirmDialog.action === "bulk-publish" &&
                "All selected items will become visible to students."}
              {confirmDialog.action === "bulk-archive" &&
                "All selected items will be archived."}
              {confirmDialog.action === "bulk-delete" &&
                "All selected items will be soft-deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmDialog({ open: false, action: "delete" })
              }
              className="text-slate-400"
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.action.includes("delete")
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
