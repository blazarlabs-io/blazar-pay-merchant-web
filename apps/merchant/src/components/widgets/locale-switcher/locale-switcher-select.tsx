"use client";

// import {CheckIcon, LanguageIcon} from '@heroicons/react/24/solid';
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import clsx from "clsx";
import { Check, Languages } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export const LocaleSwitcherSelect = ({ defaultValue, items, label }: Props) => {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;

    startTransition(() => {
      setUserLocale(locale);
      console.log(locale);
    });
  }

  return (
    <div className="relative">
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className={clsx(
            "rounded-sm p-2 transition-colors hover:bg-slate-200 gap-2",
            isPending && "pointer-events-none opacity-60",
          )}
        >
          <div>
            <Languages className="h-5 w-5 text-slate-600 transition-colors group-hover:text-foreground" />
          </div>
          <SelectValue placeholder={label} className="text-foreground" />
        </SelectTrigger>
        <SelectContent
        //   align="end"
        //   className="min-w-[8rem] overflow-hidden rounded-sm bg-white py-1 shadow-md"
        //   position="popper"
        >
          {items.map((item) => (
            <SelectItem
              key={item.value}
              //   className="flex items-center"
              className="flex cursor-default items-center text-base data-[highlighted]:bg-slate-100"
              value={item.value}
            >
              <span className="text-slate-900">{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
