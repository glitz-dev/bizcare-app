"use client";

import { useState } from "react";
import { Layers, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MajorGroup {
    id: number;
    code: string;
    name: string;
}

interface CreatemajorgroupProps {
    initialData?: MajorGroup;
    onSubmit: (data: { code: string; name: string }) => void;
    onCancel: () => void;
}

export function Createmajorgroup({
    initialData,
    onSubmit,
    onCancel,
}: CreatemajorgroupProps) {
    const isEdit = !!initialData;

    const [code, setCode] = useState(initialData?.code ?? "");
    const [name, setName] = useState(initialData?.name ?? "");
    const [errors, setErrors] = useState<{ code?: string; name?: string }>({});

    const handleClear = () => {
        setCode("");
        setName("");
        setErrors({});
    };

    const handleSubmit = () => {
        const nextErrors: { code?: string; name?: string } = {};
        if (!code.trim()) nextErrors.code = "Short name is required";
        if (!name.trim()) nextErrors.name = "Major group is required";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        onSubmit({ code: code.trim().toUpperCase(), name: name.trim().toUpperCase() });
    };

    return (
        <div className="overflow-hidden shadow-sm bg-white">
            {/* Header */}
            <div className="bg-[#004687] px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                        <Layers size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm tracking-wide truncate">
                            Major Group
                        </h1>
                        <p className="text-blue-200 text-[10px] tracking-widest uppercase">
                            {isEdit ? "Edit Major Group" : "Major Group Details"}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onCancel}
                    className="bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs h-8 px-3 rounded-lg shadow-none gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                >
                    <Plus size={13} />
                    Major Group Details
                </Button>
            </div>

            {/* Form */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                    <div className="space-y-1.5">
                        <Label htmlFor="short-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Short Name
                        </Label>
                        <Input
                            id="short-name"
                            placeholder="Short Name"
                            value={code}
                            maxLength={4}
                            onChange={(e) => {
                                setCode(e.target.value);
                                if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                            }}
                            className={errors.code ? "border-red-400 focus-visible:ring-red-300" : ""}
                        />
                        {errors.code && (
                            <p className="text-[11px] text-red-500">{errors.code}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="major-group" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Major Group
                        </Label>
                        <Input
                            id="major-group"
                            placeholder="Group Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-red-500">{errors.name}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-8 pt-5 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="h-9 px-4 text-xs font-semibold cursor-pointer"
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="h-9 px-5 text-xs font-semibold bg-[#004687] hover:bg-[#00396e] cursor-pointer"
                    >
                        {isEdit ? "Update" : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
}