"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Column } from "react-data-grid";

import { DataTable, FilterHeader, StatusBadge, ActionsCell } from "./../../common/DataTable";
import { PageFilters } from "./../../common/PageFilters";
import { PageHeader } from "./../../common/PageHeader";
import CreatePurchaseOrderForm from "@/components/Createpurchaseorderform";

import {
    fetchPurchaseOrders,
    fetchItems,
} from "@/store/features/inventory/procurement/purchaseOrderSlice";

import { ClipboardList } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

export default function PurchaseOrder() {
    // ─── View State ───────────────────────────────────────────────────────
    const [showCreateForm, setShowCreateForm] = useState(false);

    // ─── Filter State ─────────────────────────────────────────────────────
    const [fromDate, setFromDate] = useState(getOneMonthAgo());
    const [toDate, setToDate] = useState(getToday());
    const [selectedItem, setSelectedItem] = useState("");

    const dispatch = useDispatch<AppDispatch>();

    // ─── Redux State ──────────────────────────────────────────────────────
    const {
        purchaseOrders,
        loading,
        error,
        items,
        itemsLoading,
    } = useSelector((state: RootState) => state.purchaseOrder);

    // ─── Helpers ──────────────────────────────────────────────────────────────────
    function getOneMonthAgo(): string {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split("T")[0];
    }

    function getToday(): string {
        return new Date().toISOString().split("T")[0];
    }

    // ─── Handlers ─────────────────────────────────────────────────────────
    const handleSearch = useCallback(() => {
        dispatch(
            fetchPurchaseOrders({
                fromDate,
                toDate,
                rowsPerPage: 25,
                currentPage: 1,
                searchStr: "",
                itemid: selectedItem || undefined,
            })
        );
    }, [dispatch, fromDate, toDate, selectedItem]);

    const handleCreateNew = () => {
        setShowCreateForm(true);
    };

    const handleFormClose = () => {
        setShowCreateForm(false);
    };

    const handleFormSubmit = (data: any) => {
        console.log("✅ New Purchase Order submitted:", data);
        // TODO: dispatch create action, then:
        setShowCreateForm(false);
        handleSearch(); // refresh list
    };

    const handleView = (row: any) => {
        console.log("👁️ View Items for:", row.orderNo);
    };

    const handleEdit = (row: any) => {
        console.log("✏️ Edit Purchase Order:", row.orderNo);
    };

    // ─── Columns ──────────────────────────────────────────────────────────
    const columns: Column<any>[] = useMemo(
        () => [
            {
                key: "actions",
                name: "Actions",
                width: 90,
                renderCell: ({ row }) => (
                    <ActionsCell row={row} onView={handleView} onEdit={handleEdit} />
                ),
            },
            { key: "orderNo", name: "Order No.", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 110 },
            { key: "orderDate", name: "Order Date", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 110 },
            { key: "document", name: "Document", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 130 },
            { key: "party", name: "Party", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 140 },
            { key: "store", name: "Store", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 90 },
            { key: "amount", name: "Amount", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 100 },
            { key: "indentNos", name: "Indent Nos.", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 130 },
            { key: "salesOrder", name: "SalesOrder", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 130 },
            {
                key: "status",
                name: "Status",
                renderHeaderCell: (props: any) => <FilterHeader {...props} />,
                renderCell: ({ row }) => <StatusBadge label={row.status} />,
                width: 110,
            },
            { key: "custCod", name: "Cust. Cod.", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 100 },
            { key: "createdD", name: "Created D.", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 110 },
            { key: "approved", name: "Approved", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 110 },
            { key: "complete", name: "Complete", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 100 },
            { key: "prepared", name: "Prepared", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 100 },
            { key: "approved2", name: "Approved", renderHeaderCell: (props: any) => <FilterHeader {...props} />, width: 100 },
        ],
        []
    );

    // ─── Load Items for dropdown (once) ─────────────────────────────────────
    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchItems());
        }
    }, [dispatch, items.length]);

    // ─── Initial load of Purchase Orders ────────────────────────────────────
    useEffect(() => {
        dispatch(
            fetchPurchaseOrders({
                fromDate,
                toDate,
                rowsPerPage: 25,
                currentPage: 1,
                searchStr: "",
                itemid: selectedItem || undefined,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Conditional Render ───────────────────────────────────────────────
    if (showCreateForm) {
        return (
            <CreatePurchaseOrderForm
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="PURCHASE ORDER"
                subtitle="List"
                icon={<ClipboardList size={16} className="text-white" />}
                createButtonLabel="CREATE NEW PURCHASE ORDER"
                onCreateClick={handleCreateNew}
            />

            <div className="min-h-screen bg-slate-50 p-6 space-y-6">
                <PageFilters
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    items={items}
                    itemsLoading={itemsLoading}
                    loading={loading}
                    onSearch={handleSearch}
                />

                <DataTable
                    columns={columns}
                    rows={purchaseOrders}
                    rowKey="orderNo"
                    loading={loading}
                    error={error}
                    rowHeight={42}
                    headerRowHeight={58}
                />
            </div>
        </>
    );
}