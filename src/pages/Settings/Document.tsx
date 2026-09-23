"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileStack, ChevronLeft, ChevronRight } from "lucide-react";
import type { Column } from "react-data-grid";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader, StatusBadge } from "../../common/DataTable";
import CreateDocument from "../../components/CreateDocument";

import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store";
// ⚠️ adjust this path if your slice lives elsewhere
import { fetchAllDocuments } from "../../store/features/settings/systemsetup/documentSlice";

const ROWS_PER_PAGE = 15;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentRow {
  id: string;
  document: string;
  prefix: string;
  suffix: string;
  currentNo: number;
  documentType: string;
  status: "Active" | "InActive";
}

function getColumns(onEdit: (id: string) => void): Column<DocumentRow>[] {
  return [
  {
    key: "document",
    name: "Document",
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => (
      <span className="font-medium text-slate-700">{row.document || "—"}</span>
    ),
  },
  {
    key: "prefix",
    name: "Prefix",
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.prefix || "—"}</span>,
  },
  {
    key: "suffix",
    name: "Suffix",
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.suffix || "—"}</span>,
  },
  {
    key: "currentNo",
    name: "Current No.",
    width: 120,
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => <span className="text-slate-600 tabular-nums">{row.currentNo}</span>,
  },
  {
    key: "documentType",
    name: "Document Type",
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => <span className="text-slate-600">{row.documentType || "—"}</span>,
  },
  {
    key: "status",
    name: "Status",
    renderHeaderCell: (props) => (
      <FilterHeader
        column={props.column}
        filterValue={(props as any).filterValue ?? ""}
        onFilterChange={(props as any).onFilterChange}
      />
    ),
    renderCell: ({ row }) => <StatusBadge label={row.status === "Active" ? "Approved" : "Rejected"} />,
  },
    {
      key: "actions",
      name: "Actions",
      width: 100,
      renderCell: ({ row }) => (
        <ActionsCell row={row} onEdit={() => onEdit(row.id)} onDelete={() => {}} />
      ),
    },
  ];
}

export default function Document() {
  const [view, setView] = useState<"list" | "create">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [editDocumentId, setEditDocumentId] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { documentList, documentListLoading, documentListError } = useSelector(
    (state: RootState) => state.document
  );

  const columns = useMemo(
    () =>
      getColumns((id) => {
        setEditDocumentId(Number(id));
        setView("create");
      }),
    []
  );

  // The API currently ignores currentPage/rowsPerPage and always returns the
  // full dataset, so we fetch once and paginate client-side.
  useEffect(() => {
    dispatch(
      fetchAllDocuments({
        currentPage: 1,
        rowsPerPage: ROWS_PER_PAGE,
        searchStr: "",
      })
    );
  }, [dispatch]);

  const allRows: DocumentRow[] = documentList.map((doc) => ({
    id: String(doc.DocumentID),
    document: doc.DocumentName,
    prefix: doc.Prefix ?? "",
    suffix: doc.Suffix ?? "",
    currentNo: doc.StartingNo,
    documentType: doc.DocumentTypeName,
    status: doc.Active,
  }));

  const totalEntries = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const rows = allRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const rangeStart = rows.length ? startIndex + 1 : 0;
  const rangeEnd = startIndex + rows.length;

  if (view === "create") {
    return (
      <CreateDocument
        documentId={editDocumentId ?? undefined}
        onBack={() => {
          setEditDocumentId(null);
          setView("list");
        }}
        onSubmit={(data) => {
          // TODO: persist the new document (call your create-document API),
          // then return to the list.
          console.log("New document submitted:", data);
          setEditDocumentId(null);
          setView("list");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="DOCUMENT"
        subtitle="Manage document numbering series"
        icon={<FileStack size={16} className="text-white" />}
        createButtonLabel="CREATE NEW DOCUMENT"
        onCreateClick={() => {
          setEditDocumentId(null);
          setView("create");
        }}
      />

      <div className="p-5 space-y-3">
        {documentListError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {documentListError}
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────── */}
        {documentListLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            Loading documents…
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey="id" />
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-2">
          <div className="text-xs text-slate-500 font-medium">
            {rows.length
              ? `Showing ${rangeStart} to ${rangeEnd} of ${totalEntries} entries`
              : "No entries found"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || documentListLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 text-xs px-3 bg-white"
            >
              <ChevronLeft size={14} className="mr-1" /> Prev
            </Button>
            <div className="text-xs font-semibold px-2 text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || documentListLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 text-xs px-3 bg-white"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
