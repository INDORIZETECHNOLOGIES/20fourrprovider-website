import { Icon } from "@/components/ui/Icon";
import type { StaffDay } from "@/lib/api/staffAvailability";
import { STAFF_CATEGORIES } from "@/lib/api/staffAvailability";
import { MONTH_NAMES, buildMonthGrid, formatDayLong } from "@/lib/staffCalendar";
import styles from "./StaffAvailability.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const headcount = (day: StaffDay | undefined) =>
  day ? STAFF_CATEGORIES.reduce((sum, key) => sum + (day.counts?.[key] || 0), 0) : 0;

type Props = {
  year: number;
  month: number;
  days: Map<string, StaffDay>;
  selected: string | null;
  today: string;
  loading: boolean;
  canGoBack: boolean;
  onSelect: (date: string) => void;
  onMonthChange: (delta: number) => void;
};

export function StaffCalendar({ year, month, days, selected, today, loading, canGoBack, onSelect, onMonthChange }: Props) {
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

      <div className={styles.grid} role="grid" aria-label={`${MONTH_NAMES[month]} ${year} staff headcount`} aria-busy={loading}>
        {WEEKDAYS.map((name) => (
          <div key={name} className={styles.weekday} role="columnheader">
            {name}
          </div>
        ))}
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={`blank-${i}`} className={styles.blank} role="gridcell" />;

          const day = days.get(date);
          const count = headcount(day);
          const past = date < today;
          const label = `${formatDayLong(date)}: ${day?.off ? "marked off" : count > 0 ? `${count} staff` : "no staff set"}`;

          return (
            <button
              key={date}
              type="button"
              role="gridcell"
              className={`${styles.day} ${date === selected ? styles.daySelected : ""} ${date === today ? styles.dayToday : ""}`}
              disabled={past}
              aria-label={label}
              aria-pressed={date === selected}
              onClick={() => onSelect(date)}
            >
              <span className={styles.dayNumber}>{Number(date.slice(8))}</span>
              {day?.off ? (
                <span className={styles.dayOff}>Off</span>
              ) : count > 0 ? (
                <span className={styles.dayValue}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {loading ? <p className={styles.loading}>Loading this month…</p> : null}
      <p className={styles.legend}>The number on a day is the total staff you can field. Days without one have nothing set.</p>
    </div>
  );
}
