import { Icon } from "@/components/ui/Icon";
import type { StaffCategory } from "@/lib/api/staffAvailability";
import { MONTH_NAMES, buildMonthGrid, formatDayLong } from "@/lib/staffCalendar";
import { summarizeDay, type CapacityFilter, type CellSummary, type DayLoad } from "@/lib/staffCapacity";
import styles from "./StaffAvailability.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FILTER_LABELS: Record<CapacityFilter, string> = {
  all: "All staff",
  guard: "Guards",
  bouncer: "Bouncers",
  gunman: "Armed guards",
  pso: "PSOs",
  exServiceman: "Ex-servicemen",
};

function describe(summary: CellSummary): string {
  switch (summary.kind) {
    case "off":
      return summary.booked > 0 ? `marked off, but ${summary.booked} booked` : "marked off";
    case "bookedOnly":
      return `${summary.booked} booked, no staff set`;
    case "load":
      return `${summary.booked} of ${summary.declared} booked`;
    default:
      return "no staff set";
  }
}

type Props = {
  year: number;
  month: number;
  loads: Map<string, DayLoad>;
  filter: CapacityFilter;
  filters: CapacityFilter[];
  onFilterChange: (filter: StaffCategory | "all") => void;
  selected: string | null;
  today: string;
  loading: boolean;
  canGoBack: boolean;
  onSelect: (date: string) => void;
  onMonthChange: (delta: number) => void;
};

export function StaffCalendar({
  year,
  month,
  loads,
  filter,
  filters,
  onFilterChange,
  selected,
  today,
  loading,
  canGoBack,
  onSelect,
  onMonthChange,
}: Props) {
  const weeks = buildMonthGrid(year, month);

  return (
    <div>
      <div className={styles.monthBar}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => onMonthChange(-1)}
        >
          <Icon name="chevron" size={18} style={{ transform: "rotate(90deg)" }} />
        </button>
        <h3 className={styles.monthTitle} aria-live="polite">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button type="button" className={styles.navButton} aria-label="Next month" onClick={() => onMonthChange(1)}>
          <Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} />
        </button>
      </div>

      {filters.length > 1 ? (
        <div className={styles.filters} role="radiogroup" aria-label="Show staff for">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={f === filter}
              className={`${styles.filter} ${f === filter ? styles.filterActive : ""}`}
              onClick={() => onFilterChange(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.grid} role="grid" aria-label={`${MONTH_NAMES[month]} ${year} staff headcount`} aria-busy={loading}>
        {WEEKDAYS.map((name) => (
          <div key={name} className={styles.weekday} role="columnheader">
            {name}
          </div>
        ))}
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={`blank-${i}`} className={styles.blank} role="gridcell" />;

          const summary = summarizeDay(loads.get(date), filter);
          const past = date < today;

          return (
            <button
              key={date}
              type="button"
              role="gridcell"
              className={`${styles.day} ${date === selected ? styles.daySelected : ""} ${date === today ? styles.dayToday : ""}`}
              disabled={past}
              aria-label={`${formatDayLong(date)}: ${describe(summary)}`}
              aria-selected={date === selected}
              onClick={() => onSelect(date)}
            >
              <span className={styles.dayNumber}>{Number(date.slice(8))}</span>
              <DayFigure summary={summary} />
            </button>
          );
        })}
      </div>

      {loading ? <p className={styles.loading}>Loading this month…</p> : null}
      <p className={styles.legend}>
        Each day shows staff booked out of staff you can field. The bar fills as the day books up.
      </p>
    </div>
  );
}

function DayFigure({ summary }: { summary: CellSummary }) {
  if (summary.kind === "off") {
    return (
      <span className={styles.dayOff}>
        Off{summary.booked > 0 ? <span className={styles.dayWarn}> · {summary.booked} booked</span> : null}
      </span>
    );
  }
  if (summary.kind === "bookedOnly") {
    return <span className={styles.dayBookedOnly}>{summary.booked} booked</span>;
  }
  if (summary.kind !== "load") return null;

  const ratio = Math.min(1, summary.declared ? summary.booked / summary.declared : 1);
  const tone = summary.over ? styles.meterOver : summary.full ? styles.meterFull : "";
  return (
    <>
      <span className={styles.dayValue}>
        <span className={styles.dayBooked}>{summary.booked}</span>
        <span className={styles.dayOf}>/</span>
        {summary.declared}
      </span>
      <span className={`${styles.meter} ${tone}`} aria-hidden="true">
        <span className={styles.meterFill} style={{ transform: `scaleX(${ratio})` }} />
      </span>
    </>
  );
}
