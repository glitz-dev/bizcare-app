"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { Monitor } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchMachines,
  fetchMachineById,
  deleteMachine,
  clearMachineDetail,
  type MachineDetail,
} from "../../store/features/settings/systemsetup/machineregistrationSlice";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreateMachineregistration from "../../components/Createmachineregistration";
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

const PAGE_SIZE = 15;

interface MachineRow {
  MachineID: number;
  MachineCode: string;
  MachineName: string;
  MachineIP: string;
}

export default function MachineRegistration() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editData, setEditData] = useState<MachineDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MachineRow | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const {
    machineList,
    machineListLoading,
    machineListError,
    machineDetailLoading,
    machineDeleting,
  } = useSelector(
    (state: RootState) => state.machineRegistration
  );

  useEffect(() => {
    dispatch(fetchMachines());
  }, [dispatch]);

  // Back to the list, and pull the latest rows from the server.
  const handleBack = () => {
    setView("list");
    setEditData(null);
    dispatch(clearMachineDetail());
    dispatch(fetchMachines());
  };

  // Fetch the full record, then open the form prefilled with it.
  const handleEdit = async (row: MachineRow) => {
    try {
      const detail = await dispatch(
        fetchMachineById({ machineId: row.MachineID })
      ).unwrap();

      if (!detail) {
        toast.error("Machine not found");
        return;
      }

      setEditData(detail);
      setView("edit");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to load machine");
    }
  };

  const handleDeleteRequest = (row: MachineRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteMachine({ machineId: deleteTarget.MachineID })).unwrap();
      toast.success("Machine deleted successfully");
      setDeleteTarget(null);
      dispatch(fetchMachines());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete machine");
    }
  };

  const machineRows: MachineRow[] = useMemo(
    () =>
      machineList.map((m: any) => ({
        MachineID: m.MachineID,
        MachineCode: m.MachineCode,
        MachineName: m.MachineName,
        MachineIP: m.MachineIP,
      })),
    [machineList]
  );

  const columns: Column<MachineRow>[] = useMemo(
    () => [
      {
        key: "MachineCode",
        name: "Code",
        resizable: true,
        width: 160,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "MachineName",
        name: "Machine Name",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "MachineIP",
        name: "Machine IP",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "actions",
        name: "Actions",
        width: 90,
        resizable: false,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
        renderCell: ({ row }) => (
          <ActionsCell
            row={row}
            onEdit={() => handleEdit(row)}
            onDelete={() => handleDeleteRequest(row)}
          />
        ),
      },
    ],
    []
  );

  if (view === "create") {
    return <CreateMachineregistration onBack={handleBack} />;
  }

  if (view === "edit" && editData) {
    return <CreateMachineregistration editData={editData} onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="Machine Registration"
          subtitle="Inventory"
          icon={<Monitor size={16} className="text-white" />}
          createButtonLabel="Create Machine Registration"
          onCreateClick={() => setView("create")}
        />
      </div>

      <div className="px-3">
        <DataTable
          columns={columns}
          rows={machineRows}
          rowKey="MachineID"
          loading={machineListLoading || machineDetailLoading}
          error={machineListError}
          loadingLabel="Loading machines..."
          pageSize={PAGE_SIZE}
        />
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          // Keep the dialog open while the delete request is running
          if (!open && !machineDeleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Machine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.MachineCode}"` : " this machine"}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={machineDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Prevent the default auto-close so the dialog stays open until the API responds
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={machineDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-60"
            >
              {machineDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}