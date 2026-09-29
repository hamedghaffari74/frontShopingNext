"use client";

import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";

interface RatingStarsProps {
  value: number;
  onChange?: (score: number) => void;
  size?: number;
  readOnly?: boolean;
  showCount?: number;
}

export default function RatingStars({ value, onChange, size = 20, readOnly = false, showCount }: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(displayValue);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={`transition-transform ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            onClick={() => !readOnly && onChange?.(star)}
          >
            {filled ? (
              <StarFilled style={{ color: "#FBBF24", fontSize: size }} />
            ) : (
              <StarOutlined style={{ color: "#E5E7EB", fontSize: size }} />
            )}
          </button>
        );
      })}
      {showCount !== undefined && (
        <span className="mr-1 text-xs text-gray-500">({showCount})</span>
      )}
    </div>
  );
}
