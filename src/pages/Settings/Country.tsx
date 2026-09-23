"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchCountries,
  fetchCountryById,
  clearCountryDetail,
  type CountryDetail,
} from "../../store/features/settings/systemsetup/countrySlice";
import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreateCountry from "../../components/Createcountry";
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

interface CountryRow {
  CountryID: number;
  Country: string;
  CountryCode: string;
}

export default function Country() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editData, setEditData] = useState<CountryDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CountryRow | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { countryList, countryListLoading, countryDetailLoading } = useSelector(
    (state: RootState) => state.country
  );

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  // Back to the list, and pull the latest rows from the server.
  const handleBack = () => {
    setView("list");
    setEditData(null);
    dispatch(clearCountryDetail());
    dispatch(fetchCountries());
  };

  // Fetch the full record, then open the form prefilled with it.
  const handleEdit = async (row: CountryRow) => {
    try {
      const detail = await dispatch(
        fetchCountryById({ countryId: row.CountryID })
      ).unwrap();

      if (!detail) {
        toast.error("Country not found");
        return;
      }

      setEditData(detail);
      setView("edit");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to load country");
    }
  };

  const handleDeleteRequest = (row: CountryRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = () => {
    // UI only — wire this up once a DeleteCountry API is available.
    if (!deleteTarget) return;
    console.log("Delete country", deleteTarget);
    setDeleteTarget(null);
  };

  const countryRows: CountryRow[] = useMemo(
    () =>
      countryList.map((c: any) => ({
        CountryID: c.CountryID,
        Country: c.CountryName,
        CountryCode: c.CountryCode,
      })),
    [countryList]
  );

  const columns: Column<CountryRow>[] = useMemo(
    () => [
      {
        key: "Country",
        name: "Country",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "CountryCode",
        name: "Country Code",
        resizable: true,
        width: 160,
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
    return <CreateCountry onBack={handleBack} />;
  }

  if (view === "edit" && editData) {
    return <CreateCountry editData={editData} onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="Country"
          subtitle="Masters"
          icon={<Globe size={16} className="text-white" />}
          createButtonLabel="Create New Country"
          onCreateClick={() => setView("create")}
        />
      </div>

      <div className="px-3">
        <DataTable
          columns={columns}
          rows={countryRows}
          rowKey="CountryID"
          loading={countryListLoading || countryDetailLoading}
          loadingLabel="Loading countries..."
          pageSize={PAGE_SIZE}
        />
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.Country}"` : " this country"}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
