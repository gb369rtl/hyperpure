import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = [];
  for (let i = start; i <= Math.min(pages, start + 4); i++) nums.push(i);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      {total != null && (
        <p className="text-sm text-gray-500 dark:text-gray-400 nums">
          Page {page} of {pages} · {total} total
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 disabled:opacity-40 dark:border-white/15"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {start > 1 && <span className="px-1 text-gray-400">…</span>}
        {nums.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-10 w-10 rounded-lg text-sm font-semibold nums ${
              p === page ? 'bg-brand-600 text-white' : 'border border-gray-200 dark:border-white/15'
            }`}
          >
            {p}
          </button>
        ))}
        {nums[nums.length - 1] < pages && <span className="px-1 text-gray-400">…</span>}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 disabled:opacity-40 dark:border-white/15"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
