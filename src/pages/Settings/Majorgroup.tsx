"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import type { Column } from "react-data-grid";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Createmajorgroup } from "../../components/Createmajorgroup";

export interface MajorGroup {
    id: number;
    code: string;
    name: string;
}

// ─── Mock/initial data — replace with majorGroupSlice wiring ─────────────────
const initialRows: MajorGroup[] = [
    { id: 1, code: "E", name: "EXPENSE" },
    { id: 2, code: "I", name: "INCOME" },
    { id: 3, code: "L", name: "LIABILITIES" },
    { id: 4, code: "A", name: "ASSETS" },
];

type ViewMode = "list" | "create" | "edit";

export default function MajorGroup() {
    const [view, setView] = useState<ViewMode>("list");
    const [rows, setRows] = useState<MajorGroup[]>(initialRows);
    const [editingRow, setEditingRow] = useState<MajorGroup | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MajorGroup | null>(null);

    const handleCreateClick = () => {
        setEditingRow(null);
        setView("create");
    };

    const handleEdit = (row: MajorGroup) => {
        setEditingRow(row);
        setView("edit");
    };

    const handleDeleteRequest = (row: MajorGroup) => {
        setDeleteTarget(row);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        toast.success(`"${deleteTarget.name}" deleted`);
        setDeleteTarget(null);
    };

    const handleSubmit = (data: Omit<MajorGroup, "id">) => {
        if (editingRow) {
            setRows((prev) =>
                prev.map((r) => (r.id === editingRow.id ? { ...r, ...data } : r))
            );
            toast.success("Major group updated");
        } else {
            const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
            setRows((prev) => [...prev, { id: nextId, ...data }]);
            toast.success("Major group created");
        }
        setView("list");
        setEditingRow(null);
    };

    const columns: Column<MajorGroup>[] = useMemo(
        () => [
            {
                key: "code",
                name: "Code",
                width: 140,
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }: { row: MajorGroup }) => (
                    <span className="font-semibold text-[#004687]">{row.code}</span>
                ),
            },
            {
                key: "name",
                name: "Major Group",
                renderHeaderCell: (props: any) => (
                    <FilterHeader
                        column={props.column}
                        filterValue={props.filterValue}
                        onFilterChange={props.onFilterChange}
                    />
                ),
                renderCell: ({ row }: { row: MajorGroup }) => (
                    <span className="text-slate-700">{row.name}</span>
                ),
            },
            {
                key: "actions",
                name: "",
                width: 100,
                renderCell: ({ row }: { row: MajorGroup }) => (
                    <ActionsCell row={row} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                ),
            },
        ],
        []
    );

    if (view === "create" || view === "edit") {
        return (
            <Createmajorgroup
                initialData={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                    setView("list");
                    setEditingRow(null);
                }}
            />
        );
    }

    return (
    <div className="space-y-4">
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="Major Group"
          subtitle="Accounts · Master Data"
          icon={<Layers size={16} className="text-white" />}
          createButtonLabel="Create Major Group"
          onCreateClick={handleCreateClick}
        />
      </div>

      <div className="px-4">
        <DataTable
        columns={columns}
        rows={rows}
        rowKey="id"
        pageSize={10}
        loadingLabel="Loading major groups…"
      />
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete major group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget?.name}
              </span>{" "}
              from the list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}