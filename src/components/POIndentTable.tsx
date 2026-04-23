import { useEffect, useState } from "react";
import { Plus, Trash2, Barcode, Hash, Search, X, CheckSquare, List } from "lucide-react";
import { fetchItemDetailsForOpeningStock, fetchProductionItemDetails, fetchSelectedItemForPR } from "@/store/features/inventory/procurement/purchaseOrderSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

interface PORow {
    id: number;
    barcode: string;
    itemCode: string;
    item: string;
    qty: string;
    hsn: string;
    selected: boolean;
    itemId?: number;
}

const ITEMS = [
    "Hex Bolt M10",
    "Flat Washer M10",
    "Hex Nut M10",
    'PVC Pipe 1"',
    'Ball Valve 1"',
    "Copper Wire 2.5mm",
    "MS Plate 6mm",
    "Allen Key Set",
];

const defaultRow = (id: number): PORow => ({
    id,
    barcode: "",
    itemCode: "",
    item: "",
    qty: "",
    hsn: "",
    selected: false,
    itemId: undefined,
});

interface POIndentTableProps {
    onItemsSelected?: (data: any) => void;
}

export default function POIndentTable({ onItemsSelected }: POIndentTableProps) {
    const [rows, setRows] = useState<PORow[]>([defaultRow(1)]);
    const [nextId, setNextId] = useState(2);
    const dispatch = useDispatch<AppDispatch>();
    const {
        itemDetailsForOpeningStock,
        invoiceTaxTypes,
        selectedIndentItems
    } = useSelector((state: RootState) => state.purchaseOrder);

    useEffect(() => {
        dispatch(fetchItemDetailsForOpeningStock());
    }, [dispatch]);

    // Generic row updater (used by all inputs)
    const updateRow = (rowId: number, updates: Partial<PORow>) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, ...updates } : row
            )
        );
    };

   const handleItemSelect = (rowId: number, selectedItemName: string) => {
        const selectedItem = itemDetailsForOpeningStock.find(
            (item) => item.ItemName === selectedItemName
        );

        if (selectedItem) {
            updateRow(rowId, {
                item: selectedItemName,
                itemCode: selectedItem.ItemCode || "",
                hsn: selectedItem.Hsn || "",
                itemId: selectedItem.ItemID,
            });
        } else {
            updateRow(rowId, { item: "", itemCode: "", hsn: "", itemId: undefined });
        }
    };

    const handleCheckboxChange = async (rowId: number, checked: boolean) => {
        const currentRow = rows.find((r) => r.id === rowId);
        if (!currentRow) return;

        updateRow(rowId, { selected: checked });

        if (checked && currentRow.itemId) {
            const taxTypeId = invoiceTaxTypes?.[0]?.InvoiceTaxTypeID ?? 1;

            const result = await dispatch(
                fetchSelectedItemForPR({
                    itemID: currentRow.itemId,
                    invoiceTaxTypeID: taxTypeId,
                })
            );

            if (fetchSelectedItemForPR.fulfilled.match(result)) {
                // Unwrap payload — API may return { Server: { Data: [...] } }
                // or a flat array depending on how the thunk normalises it
                const raw = result.payload as any;
                const data: any[] = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.Server?.Data)
                    ? raw.Server.Data
                    : Array.isArray(raw?.Data)
                    ? raw.Data
                    : raw != null
                    ? [raw]   // single object — wrap in array
                    : [];

                if (data.length > 0) {
                    // Attach qty and indent info from the top-table row
                    const enriched = data.map((item: any) => ({
                        ...item,
                        Quantity: parseFloat(currentRow.qty) || 0,
                        IndentQty: parseFloat(currentRow.qty) || 0,
                        // carry through fields POIndentTable already knows
                        ItemCode: item.ItemCode ?? currentRow.itemCode,
                        Hsn: item.Hsn ?? currentRow.hsn,
                        ItemName: item.ItemName ?? currentRow.item,
                    }));
                    onItemsSelected?.(enriched);
                }
            }
        }
    };

    const addRow = () => {
        setRows((prev) => [...prev, defaultRow(nextId)]);
        setNextId((n) => n + 1);
    };

    const deleteRow = (id: number) => {
        if (rows.length === 1) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
    };


    return (
        <div className="p-4">
            {/* Table Container */}
            <div className="rounded-xl overflow-hidden border border-sky-200 shadow-sm">
                <table className="w-full border-collapse table-fixed">
                    {/* Header */}
                    <thead>
                        <tr
                            style={{
                                background: "linear-gradient(135deg, #1a6dbf 0%, #185FA5 60%, #0c4a8a 100%)",
                            }}
                        >
                            {/* Sl No */}
                            <th className="w-12 px-3 py-3 text-left">
                                <div className="flex items-center gap-1.5">
                                    <List size={13} className="text-sky-200" />
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Sl</span>
                                </div>
                            </th>

                            {/* Barcode */}
                            <th className="w-36 px-3 py-3 text-left border-l border-white/15">
                                <div className="flex items-center gap-1.5">
                                    <Barcode size={13} className="text-sky-200" />
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Barcode</span>
                                </div>
                            </th>

                            {/* Item Code */}
                            <th className="w-32 px-3 py-3 text-left border-l border-white/15">
                                <div className="flex items-center gap-1.5">
                                    <Hash size={13} className="text-sky-200" />
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Item Code</span>
                                </div>
                            </th>

                            {/* Item */}
                            <th className="px-3 py-3 text-left border-l border-white/15">
                                <div className="flex items-center gap-1.5">
                                    <Search size={13} className="text-sky-200" />
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Item</span>
                                </div>
                            </th>

                            {/* Qty */}
                            <th className="w-28 px-3 py-3 text-left border-l border-white/15">
                                <div className="flex items-center gap-1.5">
                                    <svg
                                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round"
                                        className="text-sky-200"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Qty</span>
                                </div>
                            </th>

                            {/* HSN */}
                            <th className="w-28 px-3 py-3 text-left border-l border-white/15">
                                <div className="flex items-center gap-1.5">
                                    <svg
                                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round"
                                        className="text-sky-200"
                                    >
                                        <path d="M4 7h16M4 12h8M4 17h4" />
                                    </svg>
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">HSN</span>
                                </div>
                            </th>

                            {/* Select */}
                            <th className="w-16 px-3 py-3 text-center border-l border-white/15">
                                <div className="flex items-center justify-center gap-1.5">
                                    <CheckSquare size={13} className="text-sky-200" />
                                    <span className="text-[12px] font-medium text-sky-100 tracking-wide">Select</span>
                                </div>
                            </th>

                            {/* Delete */}
                            <th className="w-12 px-2 py-3 border-l border-white/15" />
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr
                                key={row.id}
                                className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors bg-white"
                            >
                                {/* Sl No */}
                                <td className="px-3 py-2.5">
                                    <div className="w-7 h-7 rounded-md bg-[#185FA5] text-sky-100 text-[11px] font-medium flex items-center justify-center">
                                        {idx + 1}
                                    </div>
                                </td>

                                {/* Barcode */}
                                <td className="px-2 py-2.5 border-l border-slate-100">
                                    <input
                                        type="text"
                                        placeholder="Barcode"
                                        value={row.barcode}
                                        className="w-full h-8 px-2.5 text-[12px] text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        readOnly
                                    />
                                </td>

                                {/* Item Code */}
                                <td className="px-2 py-2.5 border-l border-slate-100">
                                    <input
                                        type="text"
                                        placeholder="Item Code"
                                        value={row.itemCode}
                                        onChange={(e) => updateRow(row.id, { itemCode: e.target.value })}
                                        className="w-full h-8 px-2.5 text-[12px] text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        readOnly
                                    />
                                </td>

                                {/* Item */}
                                <td className="px-2 py-2.5 border-l border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <select
                                            value={row.item}
                                            onChange={(e) => handleItemSelect(row.id, e.target.value)}  
                                            className="flex-1 h-8 px-2 text-[12px] text-slate-600 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 appearance-none bg-white transition-all cursor-pointer"
                                        >
                                            <option value="" disabled>Select Item</option>
                                            {itemDetailsForOpeningStock.map((item) => (
                                                <option key={item.ItemID} value={item.ItemName}>
                                                    {item.ItemName}
                                                </option>
                                            ))}
                                        </select>
                                        {row.item && (
                                            <button
                                                onClick={() => {
                                                    // Clear item
                                                    updateRow(row.id, { item: "", itemCode: "", hsn: "", itemId: undefined });
                                                }}
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                </td>

                                {/* Qty */}
                                <td className="px-2 py-2.5 border-l border-slate-100">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min={0}
                                        value={row.qty}
                                        onChange={(e) => updateRow(row.id, { qty: e.target.value })}
                                        className="w-full h-8 px-2.5 text-[12px] text-slate-700 text-right border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                    />
                                </td>

                                {/* HSN */}
                                <td className="px-2 py-2.5 border-l border-slate-100">
                                    <input
                                        type="text"
                                        placeholder="HSN"
                                        value={row.hsn}
                                        onChange={(e) => updateRow(row.id, { hsn: e.target.value })}
                                        className="w-full h-8 px-2.5 text-[12px] text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 placeholder:text-slate-300 transition-all"
                                        readOnly
                                    />
                                </td>

                                {/* Select checkbox */}
                                <td className="px-2 py-2.5 border-l border-slate-100 text-center">
                                    <input
                                        type="checkbox"
                                        checked={row.selected}
                                        onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
                                        className="w-4 h-4 rounded accent-[#185FA5] cursor-pointer"
                                    />
                                </td>

                                {/* Delete */}
                                <td className="px-2 py-2.5 border-l border-slate-100 text-center">
                                    <button
                                        onClick={() => deleteRow(row.id)}
                                        disabled={rows.length === 1}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Row Button */}
            <button
                onClick={addRow}
                className="mt-3 flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-[#185FA5] border border-dashed border-sky-300 rounded-lg hover:bg-sky-50 transition-colors"
            >
                <Plus size={14} />
                Add Row
            </button>
        </div>
    );
}