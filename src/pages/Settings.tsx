
export default function SettingsPage() {
    return (
        <div className="p-8 font-sans">

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-[#004687] tracking-tight">Settings</h1>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1.5">
                    Bizcare Overview
                </p>
            </div>

            {/* Welcome section */}
            <div className="bg-white rounded-2xl border border-[#dbe7f5] border-l-[4px] border-l-[#004687] p-7 max-w-xl">
                <h2 className="text-lg font-bold text-[#004687] mb-2">Welcome back, Admin</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    You're logged in to Bizcare ERP. Use the sidebar to navigate to Inventory, Accounts, or Settings.
                </p>
            </div>

        </div>
    );
}