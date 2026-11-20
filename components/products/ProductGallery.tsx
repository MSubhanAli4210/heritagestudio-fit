"use client";

import { useState } from "react";

type View = { label: string; src: string };

export default function ProductGallery({
  name,
  views,
}: {
  name: string;
  views: View[];
}) {
  const [active, setActive] = useState(0);
  const current = views[active] ?? views[0];

  return (
    <div>
      <div className="rounded-xl bg-cloth p-6">
        <img
          key={current.src}
          src={current.src}
          alt={`${name}, ${current.label.toLowerCase()} view`}
          className="mx-auto block max-h-[520px] w-full object-contain"
        />
      </div>

      {views.length > 1 && (
        <div className="mt-4 flex gap-3">
          {views.map((view, i) => (
            <button
              key={view.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`w-20 rounded-lg border bg-cloth p-1.5 text-center transition ${
                i === active
                  ? "border-foreground"
                  : "border-transparent hover:border-[#aaa295]"
              }`}
            >
              <img
                src={view.src}
                alt=""
                className="h-16 w-full object-contain"
              />
              <span className="mt-1 block text-[10px] font-semibold tracking-[1px] uppercase">
                {view.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}