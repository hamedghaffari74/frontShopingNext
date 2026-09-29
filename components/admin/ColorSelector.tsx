"use client";

import { useState } from "react";
import { Button, Input, Tag } from "antd";
import { PlusOutlined, CheckCircleOutlined } from "@ant-design/icons";

const PALETTE = [
  { name: "قرمز", hex: "#EF4444" },
  { name: "آبی", hex: "#3B82F6" },
  { name: "سبز", hex: "#22C55E" },
  { name: "زرد", hex: "#EAB308" },
  { name: "مشکی", hex: "#1F2937" },
  { name: "سفید", hex: "#F9FAFB" },
  { name: "نارنجی", hex: "#F97316" },
  { name: "بنفش", hex: "#A855F7" },
  { name: "صورتی", hex: "#EC4899" },
  { name: "طوسی", hex: "#6B7280" },
  { name: "قهوه‌ای", hex: "#92400E" },
  { name: "نیلی", hex: "#6366F1" },
  { name: "فیروزه‌ای", hex: "#14B8A6" },
  { name: "زرشکی", hex: "#BE123C" },
  { name: "یشمی", hex: "#059669" },
  { name: "نقره‌ای", hex: "#94A3B8" },
  { name: "طلایی", hex: "#D97706" },
  { name: "کرم", hex: "#F5E6CC" },
  { name: "سرمه‌ای", hex: "#1E3A5F" },
  { name: "زیتونی", hex: "#708238" },
];

export default function ColorSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (colors: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState("");

  const toggleColor = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((c) => c !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selected.includes(trimmed)) {
      setCustomInput("");
      return;
    }
    onChange([...selected, trimmed]);
    setCustomInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {PALETTE.map((color) => {
          const isSelected = selected.includes(color.name);
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color.name)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                isSelected
                  ? "border-gray-400 bg-gray-50 shadow-sm scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full border border-gray-300 shadow-inner"
                style={{
                  backgroundColor: color.hex,
                  ...(color.name === "سفید" && { borderColor: "#D1D5DB" }),
                }}
              />
              {color.name}
              {isSelected && (
                <CheckCircleOutlined className="text-blue-500 text-xs" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="رنگ دلخواه..."
          onPressEnter={addCustom}
          size="small"
          className="w-40"
        />
        <Button size="small" onClick={addCustom} icon={<PlusOutlined />}>
          افزودن
        </Button>
      </div>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((c) => {
            const paletteColor = PALETTE.find((p) => p.name === c);
            return (
              <Tag
                key={c}
                closable
                onClose={() => toggleColor(c)}
                className="rounded-full px-3 py-0.5"
                icon={
                  paletteColor ? (
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: paletteColor.hex }}
                    />
                  ) : undefined
                }
              >
                {c}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}
