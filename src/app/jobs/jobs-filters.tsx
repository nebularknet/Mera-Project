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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const triggerCls =
  "h-10 border-white/10 bg-[#121212] text-white data-[placeholder]:text-white/40 focus:ring-[#0dcaf0]/50";
const contentCls = "border-white/10 bg-[#121212] text-white";
const itemCls = "focus:bg-white/10 focus:text-white";

const ALL = "__all__";

interface JobsFiltersProps {
  departments: string[];
  locations: string[];
  employmentTypes: string[];
}

export function JobsFilters({
  departments,
  locations,
  employmentTypes,
}: JobsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/jobs";
  const searchParams = useSearchParams();
  const params = React.useMemo(() => searchParams ?? new URLSearchParams(), [searchParams]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setCheckboxParam = (key: string, checked: boolean) => {
    const next = new URLSearchParams(params.toString());
    if (checked) next.set(key, "true");
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const [search, setSearch] = React.useState(params.get("search") ?? "");

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (params.get("search") ?? "")) {
        setParam("search", search);
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearch(params.get("search") ?? "");
  }, [params]);

  const hasFilters = Array.from(params.keys()).length > 0;
  const cur = (k: string) => params.get(k) ?? ALL;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0a0a0a] p-5 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title or description..."
            className="h-10 border-white/10 bg-[#121212] pl-10 text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50"
          />
        </div>

        {/* Department Filter */}
        <FilterSelect
          label="Department"
          value={cur("department")}
          onChange={(v) => setParam("department", v)}
          options={departments.map((d) => ({ value: d, label: d }))}
        />

        {/* Location Filter */}
        <FilterSelect
          label="Location"
          value={cur("location")}
          onChange={(v) => setParam("location", v)}
          options={locations.map((l) => ({ value: l, label: l }))}
        />

        {/* Employment Type Filter */}
        <FilterSelect
          label="Employment Type"
          value={cur("employmentType")}
          onChange={(v) => setParam("employmentType", v)}
          options={employmentTypes.map((t) => ({ value: t, label: t }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-6">
          {/* Featured checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={params.get("featured") === "true"}
              onCheckedChange={(checked) => setCheckboxParam("featured", !!checked)}
              className="border-white/20 data-[state=checked]:bg-[#0dcaf0] data-[state=checked]:text-black"
            />
            <Label htmlFor="featured" className="text-sm text-white/80 cursor-pointer select-none">
              Featured positions only
            </Label>
          </div>

          {/* Open Only checkbox - defaults to true (if not specified, we can default to true) */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="openOnly"
              checked={params.get("openOnly") !== "false"}
              onCheckedChange={(checked) => {
                const next = new URLSearchParams(params.toString());
                if (!checked) {
                  next.set("openOnly", "false");
                } else {
                  next.delete("openOnly");
                }
                router.replace(`${pathname}?${next.toString()}`, { scroll: false });
              }}
              className="border-white/20 data-[state=checked]:bg-[#0dcaf0] data-[state=checked]:text-black"
            />
            <Label htmlFor="openOnly" className="text-sm text-white/80 cursor-pointer select-none">
              Open roles only
            </Label>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.replace(pathname);
            }}
            className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" /> Clear all filters
          </button>
        )}
      </div>
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
      <SelectTrigger className={`${triggerCls} w-[180px] gap-2 justify-between`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className={contentCls}>
        <SelectItem value={ALL} className={itemCls}>
          All {label}s
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
