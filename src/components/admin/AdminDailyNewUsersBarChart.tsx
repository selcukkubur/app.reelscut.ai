import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type DailyNewUserPoint = {
  date: string;
  label: string;
  count: number;
};

type AdminDailyNewUsersBarChartProps = {
  data: DailyNewUserPoint[];
};

export function AdminDailyNewUsersBarChart({ data }: AdminDailyNewUsersBarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-300">No daily user data available yet.</p>;
  }

  const totalNewUsers = data.reduce((sum, point) => sum + point.count, 0);
  const maxNewUsers = data.reduce((max, point) => Math.max(max, point.count), 0);
  const nonZeroDays = data.reduce((sum, point) => sum + (point.count > 0 ? 1 : 0), 0);
  const peakPoint = data.reduce((best, point) => {
    if (!best || point.count > best.count) {
      return point;
    }
    return best;
  }, null as DailyNewUserPoint | null);
  const tickStep = data.length > 70 ? 14 : 7;
  const tickIndexes = new Set<number>([0, data.length - 1]);
  for (let index = tickStep; index < data.length - 1; index += tickStep) {
    tickIndexes.add(index);
  }
  const sortedTickIndexes = Array.from(tickIndexes).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total new users</div>
          <div className="mt-1 text-xl font-semibold leading-none text-gray-900 dark:text-gray-100">{totalNewUsers.toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Peak day</div>
          <div className="mt-1 text-xl font-semibold leading-none text-gray-900 dark:text-gray-100">{maxNewUsers.toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Days with signups</div>
          <div className="mt-1 text-xl font-semibold leading-none text-gray-900 dark:text-gray-100">{nonZeroDays.toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Highest date</div>
          <div className="mt-1 text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">{peakPoint?.label ?? '—'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <div className="flex h-44 w-full items-end gap-px overflow-hidden rounded-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
            {data.map((point) => {
              const rawHeight = maxNewUsers > 0 ? (point.count / maxNewUsers) * 100 : 0;
              const normalizedHeight = point.count > 0 ? Math.max(rawHeight, 5) : 2;

              return (
                <Tooltip key={point.date}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${point.label}: ${point.count.toLocaleString()} new users`}
                      className={point.count > 0
                        ? 'h-full flex-1 min-w-0 rounded-t-sm bg-blue-500/80 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-400/80 dark:hover:bg-blue-400'
                        : 'h-full flex-1 min-w-0 rounded-t-sm bg-gray-200 transition-colors hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700'}
                      style={{ height: `${normalizedHeight}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="font-medium">{point.count.toLocaleString()} new users</div>
                    <div className="text-[11px] opacity-80">{point.label}</div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <div className="relative h-4 text-[10px] text-gray-500 dark:text-gray-400">
          {sortedTickIndexes.map((index) => {
            const point = data[index];
            const isFirst = index === 0;
            const isLast = index === data.length - 1;
            if (isFirst) {
              return (
                <span key={`${point.date}-tick`} className="absolute left-0">
                  {point.label}
                </span>
              );
            }
            if (isLast) {
              return (
                <span key={`${point.date}-tick`} className="absolute right-0">
                  {point.label}
                </span>
              );
            }
            return (
              <span
                key={`${point.date}-tick`}
                className="absolute -translate-x-1/2"
                style={{ left: `${(index / (data.length - 1)) * 100}%` }}
              >
                {point.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
