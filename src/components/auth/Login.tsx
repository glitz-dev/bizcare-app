import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { useNavigate } from 'react-router-dom';
import {
    fetchCompanies,
    fetchFinancialYears,
    loginUser,
    setSelectedCompany,
    setSelectedFinYear,
} from "../../store/features/auth/authSlice";

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        companies,
        finYears,
        selectedCompany,
        selectedFinYear,
        loading: reduxLoading,
        error,
    } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState("");          
    const [password, setPassword] = useState("");       
    const [showPassword, setShowPassword] = useState(false);
    const [localLoading, setLocalLoading] = useState(false); 
    const navigate = useNavigate();    
    
    useEffect(() => {
        dispatch(fetchCompanies());     
        dispatch(fetchFinancialYears()); 
    }, [dispatch]);

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const company = companies.find((c) => c.CompanyID === Number(e.target.value));
        if (company) dispatch(setSelectedCompany(company));
    };

    const handleFinYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fy = finYears.find((f) => f.FinYearID === Number(e.target.value));
        if (fy) dispatch(setSelectedFinYear(fy));
    };

    const handleSubmit = async () => {
        if (!selectedCompany || !selectedFinYear) {
            alert("Please select company and financial year");
            return;
        }

        setLocalLoading(true);
        try {
            await dispatch(
                loginUser({
                    username,
                    password,
                    company: selectedCompany,
                    finYear: selectedFinYear,
                })
            ).unwrap();
            navigate('/dashboard');
            console.log("Login successful! Token saved.");
            // e.g. navigate('/dashboard');
        } catch (err: any) {
            console.error("Login failed: " + err);
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex w-5/12 flex-col justify-between p-14 bg-[#004687] relative overflow-hidden">

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Decorative orbs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400 opacity-10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-sky-300 opacity-10 blur-3xl pointer-events-none" />

                {/* Top: icon + version */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.9" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.9" />
                        </svg>
                    </div>
                    <span className="text-[10px] text-white/40 tracking-widest border border-white/10 rounded-md px-2.5 py-1 bg-white/5">
                        v10
                    </span>
                </div>

                {/* Center: Brand */}
                <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium mb-4">
                        Enterprise Resource Planning
                    </p>
                    <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                        BIZ<span className="text-sky-300">CARE </span>
                        ERP
                    </h1>
                    <p className="mt-5 text-sm text-white/40 leading-relaxed max-w-xs font-light">
                        A unified platform to manage your entire business operations with precision and clarity.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-col gap-3 mt-8">
                        {[
                            "Real-time Analytics Dashboard",
                            "Multi-company Support",
                            "Audit Trail & Compliance",
                        ].map((feature) => (
                            <div
                                key={feature}
                                className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 w-fit"
                            >
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: Stats */}
                <div className="relative z-10">
                    <div className="h-px bg-white/10 mb-6" />
                    <div className="flex gap-10">
                        {[
                            ["100+", "Companies"],
                            ["1M+", "Transactions"],
                            ["99.9%", "Uptime"],
                        ].map(([num, label]) => (
                            <div key={label}>
                                <div className="text-2xl font-bold text-white">{num}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/35 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center bg-white p-6">
                <div className="w-full max-w-sm">

                    {/* Mobile brand */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-black text-[#004687] tracking-tight">
                            BIZCARE ERP
                        </h1>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 mb-8">
                        Sign in to your workspace to continue
                    </p>

                    {/* Username */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200 focus:border-[#004687] focus:bg-white focus:ring-2 focus:ring-[#004687]/10"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200 focus:border-[#004687] focus:bg-white focus:ring-2 focus:ring-[#004687]/10"
                                required
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004687] transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Company */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                            Company
                        </label>
                        <div className="relative">
                            <select
                                value={selectedCompany?.CompanyID ?? ""}
                                onChange={handleCompanyChange}
                                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-[#004687] focus:bg-white focus:ring-2 focus:ring-[#004687]/10 cursor-pointer"
                            >
                                <option value="" disabled>Select company</option>
                                {companies.map((c) => (
                                    <option key={c.CompanyID} value={c.CompanyID}>
                                        {c.CompanyName} {c.Code ? `(${c.Code})` : ""}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Financial Year */}
                    <div className="mb-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                            Financial Year
                        </label>
                        <div className="relative">
                            <select
                                value={selectedFinYear?.FinYearID ?? ""}
                                onChange={handleFinYearChange}
                                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 ..."
                            >
                                <option value="" disabled>Select financial year</option>
                                {finYears.map((y) => (
                                    <option key={y.FinYearID} value={y.FinYearID}>
                                        {y.FinYearName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                        </div>
                    </div>

                    {/* Forgot password */}
                    <div className="flex justify-end mb-5 mt-2">
                        <a href="#" className="text-xs text-[#004687] font-medium hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={reduxLoading || localLoading}
                        className="w-full py-3 rounded-xl bg-[#004687] hover:bg-[#003a73] active:scale-[0.99] text-white text-sm font-semibold tracking-wide transition-all duration-200 shadow-lg shadow-[#004687]/25 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {(reduxLoading || localLoading) ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}