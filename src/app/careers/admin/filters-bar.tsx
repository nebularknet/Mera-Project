"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type JobOption = { id: string; title: string };

const triggerCls =
  "h-9 border-white/10 bg-[#121212] text-white data-[placeholder]:text-white/40 focus:ring-[#0dcaf0]/50";
const contentCls = "border-white/10 bg-[#121212] text-white";
const itemCls = "focus:bg-white/10 focus:text-white";

const ALL = "__all__";

const STATUSES = ["pending", "shortlisted", "rejected"];
const GENDERS = ["Male", "Female"];
const EDUCATIONS = ["Bachelor's Degree", "Master's Degree", "MPhil", "PhD"];

export function FiltersBar({
  jobs,
  cities,
  universities,
}: {
  jobs: JobOption[];
  cities: string[];
  universities: string[];
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/careers/admin";
  const params = useSearchParams() ?? new URLSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const [search, setSearch] = React.useState(params.get("search") ?? "");
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (params.get("search") ?? "")) setParam("search", search);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = Array.from(params.keys()).length > 0;

  const cur = (k: string) => params.get(k) ?? ALL;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="h-9 w-56 border-white/10 bg-[#121212] pl-8 text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50"
        />
      </div>

      <FilterSelect label="Role" value={cur("jobId")} onChange={(v) => setParam("jobId", v)}
        options={jobs.map((j) => ({ value: j.id, label: j.title }))} />

      <FilterSelect label="Status" value={cur("status")} onChange={(v) => setParam("status", v)}
        options={STATUSES.map((s) => ({ value: s, label: cap(s) }))} />

      <FilterSelect label="Gender" value={cur("gender")} onChange={(v) => setParam("gender", v)}
        options={GENDERS.map((s) => ({ value: s, label: s }))} />

      <FilterSelect label="Education" value={cur("education")} onChange={(v) => setParam("education", v)}
        options={EDUCATIONS.map((s) => ({ value: s, label: s }))} />

      {cities.length > 0 && (
        <FilterSelect label="City" value={cur("city")} onChange={(v) => setParam("city", v)}
          options={cities.map((s) => ({ value: s, label: s }))} />
      )}

      {universities.length > 0 && (
        <FilterSelect label="University" value={cur("university")} onChange={(v) => setParam("university", v)}
          options={universities.map((s) => ({ value: s, label: s }))} />
      )}

      <FilterSelect label="Experience" value={cur("experience")} onChange={(v) => setParam("experience", v)}
        options={[
          { value: "yes", label: "Has experience" },
          { value: "no", label: "No experience" },
        ]} />

      {/* Applied date range */}
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          aria-label="Applied from"
          value={params.get("dateFrom") ?? ""}
          onChange={(e) => setParam("dateFrom", e.target.value)}
          className="h-9 w-[8.5rem] border-white/10 bg-[#121212] text-white [color-scheme:dark] focus-visible:ring-[#0dcaf0]/50"
        />
        <span className="text-white/40">–</span>
        <Input
          type="date"
          aria-label="Applied to"
          value={params.get("dateTo") ?? ""}
          onChange={(e) => setParam("dateTo", e.target.value)}
          className="h-9 w-[8.5rem] border-white/10 bg-[#121212] text-white [color-scheme:dark] focus-visible:ring-[#0dcaf0]/50"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            router.replace(pathname);
          }}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${triggerCls} w-auto min-w-[7rem] gap-1`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className={contentCls}>
        <SelectItem value={ALL} className={itemCls}>
          All {label.toLowerCase()}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className={itemCls}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
