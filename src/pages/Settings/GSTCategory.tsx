"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type Column } from "react-data-grid";
import { Receipt } from "lucide-react";

import { PageHeader } from "../../common/PageHeader";
import { DataTable, ActionsCell, FilterHeader } from "../../common/DataTable";
import CreateGstCategory from "../../components/Creategstcategory";
import { fetchGSTCategory, fetchGSTCategoryByID, clearGSTCategoryDetail } from "../../store/features/settings/systemsetup/gstcategorySlice";
import type { GSTCategory as GSTCategoryRow } from "../../store/features/settings/systemsetup/gstcategorySlice";

const PAGE_SIZE = 15;

export default function GSTCategory() {
  const [view, setView] = useState<"list" | "create">("list");
  const [editingId, setEditingId] = useState<number | null>(null);

  const dispatch = useDispatch<any>();
  const { gstCategoryList, gstCategoryLoading, gstCategoryError } = useSelector(
    (state: any) => state.gstCategory
  );

  useEffect(() => {
    dispatch(fetchGSTCategory());
  }, [dispatch]);

  const handleEdit = (row: GSTCategoryRow) => {
    dispatch(fetchGSTCategoryByID({ GSTCategoryMID: row.GSTCategoryMID }));
    setEditingId(row.GSTCategoryMID);
    setView("create");
  };

  const columns: Column<GSTCategoryRow>[] = useMemo(
    () => [
      {
        key: "GSTCategoryName",
        name: "GST Category Name",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "HSN",
        name: "HSN",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "TaxCategoryName",
        name: "Tax Category",
        resizable: true,
        renderHeaderCell: (props) => <FilterHeader {...(props as any)} />,
      },
      {
        key: "WEFDate",
        name: "W.E. Date",
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
          <ActionsCell row={row} onEdit={() => handleEdit(row)} onDelete={() => {}} />
        ),
      },
    ],
    []
  );

  if (view === "create") {
    return (
      <CreateGstCategory
        gstCategoryMID={editingId}
        onBack={() => {
          setView("list");
          setEditingId(null);
          dispatch(clearGSTCategoryDetail());
          dispatch(fetchGSTCategory());
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden shadow-sm">
        <PageHeader
          title="GST Category"
          subtitle="Masters"
          icon={<Receipt size={16} className="text-white" />}
          createButtonLabel="Create GST Category"
          onCreateClick={() => {
            setEditingId(null);
            setView("create");
          }}
        />
      </div>

      <div className="px-3">
        <DataTable
          columns={columns}
          rows={gstCategoryList}
          rowKey="GSTCategoryMID"
          loading={gstCategoryLoading}
          error={gstCategoryError}
          loadingLabel="Loading GST categories..."
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
