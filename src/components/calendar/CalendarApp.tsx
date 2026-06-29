import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  ListFilter,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  calendarResources,
  calendarSeedEvents,
  calendarStatuses,
  type CalendarEvent,
  type CalendarResourceId,
  type CalendarStatus,
} from "../../content/calendar";
import { exportCalendarEventsToXlsx, exportCalendarTemplateToXlsx, importCalendarEventsFromFile } from "./calendar-excel";
import "./calendar-ui.css";

type CalendarView = "month" | "week" | "list";
type CalendarMode = "public" | "admin";
type CalendarAppProps = {
  mode?: CalendarMode;
};
type EventDraft = Omit<CalendarEvent, "id" | "resourceLabel" | "resourceGroup">;

const dayFormatter = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" });

const statusLabels: Record<CalendarStatus, string> = {
  volno: "Volno",
  obsazeno: "Obsazeno",
  trénink: "Trénink",
  zápas: "Zápas",
  "čeká na schválení": "Čeká na schválení",
};

const statusTone: Record<CalendarStatus, string> = {
  volno: "is-free",
  obsazeno: "is-booked",
  trénink: "is-training",
  zápas: "is-match",
  "čeká na schválení": "is-pending",
};

const defaultDraft: EventDraft = {
  title: "Nový zápis",
  resourceId: "football",
  status: "čeká na schválení",
  start: "2026-06-29T14:00",
  end: "2026-06-29T16:00",
  contactName: "Jan Novák",
  contactValue: "+420 777 123 456",
  note: "Nový ruční zápis do kalendáře.",
};

export default function CalendarApp({ mode = "public" }: CalendarAppProps) {
  const isAdmin = mode === "admin";
  const [events, setEvents] = useState<CalendarEvent[]>(() => [...calendarSeedEvents]);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date("2026-06-24T12:00:00"));
  const [activeResources, setActiveResources] = useState<Set<CalendarResourceId>>(
    () => new Set(calendarResources.map((resource) => resource.id)),
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<CalendarStatus>>(() => new Set(calendarStatuses));
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState(() =>
    isAdmin ? "Kalendář připraven k úpravám." : "Kalendář připraven k prohlížení.",
  );
  const [isReady, setIsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsReady(true);
    let isMounted = true;

    async function loadEvents() {
      try {
        const response = await fetch("/api/calendar", { credentials: "same-origin" });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { events?: CalendarEvent[] };
        if (isMounted && Array.isArray(payload.events)) {
          setEvents(payload.events);
          setMessage("Kalendář načtený.");
        }
      } catch {
        if (isMounted && isAdmin) {
          setMessage("Kalendář běží lokálně. Online ukládání se ověří po nasazení.");
        }
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const selectedEvent = events.find((event) => event.id === selectedId) ?? null;
  const visibleEvents = useMemo(
    () =>
      events
        .filter((event) => activeResources.has(event.resourceId))
        .filter((event) => activeStatuses.has(event.status))
        .filter((event) => {
          const value = `${event.title} ${event.resourceLabel} ${event.status} ${event.contactName} ${event.contactValue}`.toLowerCase();
          return value.includes(query.toLowerCase().trim());
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [activeResources, activeStatuses, events, query],
  );

  const periodLabel = view === "month" ? monthFormatter.format(cursor) : createWeekLabel(cursor);
  const monthDays = useMemo(() => getMonthGrid(cursor), [cursor]);
  const weekDays = useMemo(() => getWeekDays(cursor), [cursor]);

  function movePeriod(direction: -1 | 1) {
    setCursor((current) => {
      const next = new Date(current);
      if (view === "month") {
        next.setMonth(next.getMonth() + direction);
      } else {
        next.setDate(next.getDate() + 7 * direction);
      }
      return next;
    });
  }

  function toggleResource(resourceId: CalendarResourceId) {
    setActiveResources((current) => toggleSet(current, resourceId));
  }

  function toggleStatus(status: CalendarStatus) {
    setActiveStatuses((current) => toggleSet(current, status));
  }

  async function persistEvents(nextEvents: CalendarEvent[], successMessage: string) {
    setEvents(nextEvents);

    if (!isAdmin) {
      setMessage(successMessage);
      return;
    }

    try {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: nextEvents }),
      });
      const payload = (await response.json()) as { events?: CalendarEvent[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Kalendář se nepodařilo uložit.");
      }
      if (Array.isArray(payload.events)) {
        setEvents(payload.events);
      }
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kalendář se nepodařilo uložit.");
    }
  }

  function submitDraft() {
    if (!isAdmin) {
      return;
    }
    const resource = calendarResources.find((item) => item.id === draft.resourceId) ?? calendarResources[0];
    const event: CalendarEvent = {
      ...draft,
      id: `evt-${Date.now()}`,
      resourceLabel: resource.label,
      resourceGroup: resource.group,
    };
    const nextEvents = [...events, event];
    void persistEvents(nextEvents, "Zápis přidán a uložen.");
    setSelectedId(event.id);
  }

  function updateSelectedEvent(updated: CalendarEvent) {
    if (!isAdmin) {
      return;
    }
    const resource = calendarResources.find((item) => item.id === updated.resourceId) ?? calendarResources[0];
    const normalized = { ...updated, resourceLabel: resource.label, resourceGroup: resource.group };
    const nextEvents = events.map((event) => (event.id === normalized.id ? normalized : event));
    void persistEvents(nextEvents, "Změna uložena.");
    setSelectedId(normalized.id);
  }

  function deleteSelectedEvent() {
    if (!selectedEvent || !isAdmin) {
      return;
    }
    const nextEvents = events.filter((event) => event.id !== selectedEvent.id);
    void persistEvents(nextEvents, "Zápis odstraněn.");
    setSelectedId(null);
  }

  function downloadXlsx(bytes: Uint8Array, filename: string) {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportXlsx() {
    downloadXlsx(exportCalendarEventsToXlsx(events), "banik-rynholec-kalendar.xlsx");
    setMessage("Excel export stažený.");
  }

  function exportTemplateXlsx() {
    downloadXlsx(exportCalendarTemplateToXlsx(), "banik-rynholec-kalendar-sablona.xlsx");
    setMessage("Excel šablona stažená.");
  }

  async function importFile(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const imported = await importCalendarEventsFromFile(file);
      setSelectedId(null);
      setQuery("");
      setView("month");
      setActiveResources(new Set(calendarResources.map((resource) => resource.id)));
      setActiveStatuses(new Set(calendarStatuses));
      const firstImportedDate = imported[0] ? new Date(imported[0].start) : null;
      if (firstImportedDate && !Number.isNaN(firstImportedDate.getTime())) {
        setCursor(firstImportedDate);
      }
      await persistEvents(imported, `Importováno ${imported.length} zápisů z Excel/CSV souboru.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import se nepodařil.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function resetData() {
    void persistEvents([...calendarSeedEvents], "Ukázková data obnovena.");
    setSelectedId(null);
  }

  return (
    <section aria-busy={!isReady} aria-label="Správa kalendáře" className="calendar-app" data-ready={isReady}>
      <div className="calendar-shell-v2">
        <aside className="calendar-sidebar">
          <div className="sidebar-heading">
            <ListFilter aria-hidden="true" size={22} />
            <h2>Filtry</h2>
          </div>

          <label className="search-field">
            <Search aria-hidden="true" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hledat zápis"
              type="search"
            />
          </label>

          <FilterGroup title="Prostory a týmy">
            {calendarResources.map((resource) => (
              <label className="check-row" key={resource.id}>
                <input
                  checked={activeResources.has(resource.id)}
                  onChange={() => toggleResource(resource.id)}
                  type="checkbox"
                />
                <span>{resource.label}</span>
                <small>{resource.group}</small>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Stavy">
            {calendarStatuses.map((status) => (
              <label className="check-row" key={status}>
                <input checked={activeStatuses.has(status)} onChange={() => toggleStatus(status)} type="checkbox" />
                <span>{statusLabels[status]}</span>
                <i className={`status-dot ${statusTone[status]}`} aria-hidden="true" />
              </label>
            ))}
          </FilterGroup>

          <div className="filter-count">
            <strong>{visibleEvents.length}</strong>
            <span>zápisů v aktuálním výběru</span>
          </div>

          <div className="calendar-message" role="status">
            {message}
          </div>
        </aside>

        <div className="calendar-main">
          <div className="calendar-toolbar">
            <div className="view-switch" aria-label="Zobrazení kalendáře">
              {(["month", "week", "list"] as const).map((item) => (
                <button className={view === item ? "is-active" : ""} key={item} onClick={() => setView(item)} type="button">
                  {item === "month" ? "Měsíc" : item === "week" ? "Týden" : "Seznam"}
                </button>
              ))}
            </div>

            <div className="period-control">
              <button aria-label="Předchozí období" onClick={() => movePeriod(-1)} type="button">
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <strong>{periodLabel}</strong>
              <button aria-label="Další období" onClick={() => movePeriod(1)} type="button">
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>

            {isAdmin && (
              <div className="calendar-actions">
                <button className="utility-button" onClick={exportTemplateXlsx} type="button">
                  <Download aria-hidden="true" size={17} />
                  Stáhnout šablonu
                </button>
                <button className="utility-button" onClick={() => fileInputRef.current?.click()} type="button">
                  <FileUp aria-hidden="true" size={17} />
                  Import Excel
                </button>
                <button className="utility-button" onClick={exportXlsx} type="button">
                  <Download aria-hidden="true" size={17} />
                  Export Excel
                </button>
                <button className="utility-button" onClick={resetData} type="button">
                  <RotateCcw aria-hidden="true" size={17} />
                  Reset
                </button>
                <input
                  accept=".xlsx,.xls,.csv"
                  hidden
                  onChange={(event) => void importFile(event.target.files?.[0])}
                  ref={fileInputRef}
                  type="file"
                />
              </div>
            )}
          </div>

          <div className="calendar-content">
            {isAdmin && (
              <section className="booking-composer" aria-labelledby="new-booking">
                <div>
                  <h2 id="new-booking">Nový zápis</h2>
                  <p>Zadejte nový zápis ručně, nebo nahrajte připravený Excel od správce areálu.</p>
                </div>
                <DraftForm draft={draft} onChange={setDraft} onSubmit={submitDraft} />
              </section>
            )}

            {view === "month" && <MonthView days={monthDays} events={visibleEvents} onSelect={setSelectedId} />}
            {view === "week" && <WeekView days={weekDays} events={visibleEvents} onSelect={setSelectedId} />}
            {view === "list" && <ListView events={visibleEvents} onSelect={setSelectedId} />}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          editable={isAdmin}
          onClose={() => setSelectedId(null)}
          onDelete={deleteSelectedEvent}
          onSave={updateSelectedEvent}
        />
      )}
    </section>
  );
}

function FilterGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function DraftForm({
  draft,
  onChange,
  onSubmit,
}: {
  draft: EventDraft;
  onChange: (draft: EventDraft) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="draft-grid">
      <TextField label="Název" value={draft.title} onChange={(value) => onChange({ ...draft, title: value })} />
      <SelectField
        label="Prostor / tým"
        value={draft.resourceId}
        onChange={(value) => onChange({ ...draft, resourceId: value as CalendarResourceId })}
        options={calendarResources.map((resource) => ({ value: resource.id, label: resource.label }))}
      />
      <SelectField
        label="Stav"
        value={draft.status}
        onChange={(value) => onChange({ ...draft, status: value as CalendarStatus })}
        options={calendarStatuses.map((status) => ({ value: status, label: statusLabels[status] }))}
      />
      <TextField label="Začátek" type="datetime-local" value={draft.start} onChange={(value) => onChange({ ...draft, start: value })} />
      <TextField label="Konec" type="datetime-local" value={draft.end} onChange={(value) => onChange({ ...draft, end: value })} />
      <TextField
        label="Kontakt"
        value={draft.contactValue}
        onChange={(value) => onChange({ ...draft, contactValue: value })}
      />
      <TextField
        label="Jméno"
        value={draft.contactName}
        onChange={(value) => onChange({ ...draft, contactName: value })}
      />
      <label className="field field-wide">
        <span>Poznámka</span>
        <textarea value={draft.note} onChange={(event) => onChange({ ...draft, note: event.target.value })} rows={3} />
      </label>
      <button className="save-button" onClick={onSubmit} type="button">
        <Plus aria-hidden="true" size={18} />
        Přidat zápis
      </button>
    </div>
  );
}

function MonthView({
  days,
  events,
  onSelect,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="month-view" aria-label="Měsíční zobrazení">
      {days.map((day) => {
        const dayEvents = events.filter((event) => sameDay(new Date(event.start), day));
        return (
          <article className="month-cell" key={day.toISOString()}>
            <header>
              <span>{weekdayFormatter.format(day)}</span>
              <strong>{day.getDate()}</strong>
            </header>
            <div>
              {dayEvents.map((event) => (
                <EventPill event={event} key={event.id} onSelect={onSelect} />
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function WeekView({
  days,
  events,
  onSelect,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="week-view" aria-label="Týdenní zobrazení">
      {days.map((day) => {
        const dayEvents = events.filter((event) => sameDay(new Date(event.start), day));
        return (
          <article className="week-column" key={day.toISOString()}>
            <header>
              <span>{weekdayFormatter.format(day)}</span>
              <strong>{dayFormatter.format(day)}</strong>
            </header>
            <div className="week-events">
              {dayEvents.length === 0 && <p>Volno</p>}
              {dayEvents.map((event) => (
                <EventPill event={event} key={event.id} onSelect={onSelect} />
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ListView({ events, onSelect }: { events: CalendarEvent[]; onSelect: (id: string) => void }) {
  return (
    <section className="list-view" aria-label="Seznamové zobrazení">
      {events.length === 0 && <p className="empty-state">Žádný zápis neodpovídá aktuálním filtrům.</p>}
      {events.map((event) => (
        <button className="list-row" key={event.id} onClick={() => onSelect(event.id)} type="button">
          <span className="date-stack">
            <strong>{dayFormatter.format(new Date(event.start))}</strong>
            <small>{formatTimeRange(event)}</small>
          </span>
          <span>
            <strong>{event.title}</strong>
            <small>{event.resourceLabel} · {event.contactName}</small>
          </span>
          <i className={`status-badge ${statusTone[event.status]}`}>{statusLabels[event.status]}</i>
        </button>
      ))}
    </section>
  );
}

function EventPill({ event, onSelect }: { event: CalendarEvent; onSelect: (id: string) => void }) {
  return (
    <button
      aria-label={`${event.title}, ${event.resourceLabel}, ${statusLabels[event.status]}, ${formatTimeRange(event)}`}
      className={`event-pill ${statusTone[event.status]}`}
      onClick={() => onSelect(event.id)}
      type="button"
    >
      <span>{formatTimeRange(event)}</span>
      <strong>{event.title}</strong>
      <small>{event.resourceLabel}</small>
    </button>
  );
}

function EventDetail({
  editable,
  event,
  onClose,
  onDelete,
  onSave,
}: {
  editable: boolean;
  event: CalendarEvent;
  onClose: () => void;
  onDelete: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const [draft, setDraft] = useState(event);

  return (
    <div className="event-overlay" role="presentation">
      <section aria-labelledby="event-detail-title" aria-modal="true" className="event-detail" role="dialog">
        <header>
          <div>
            <span className={`status-badge ${statusTone[draft.status]}`}>{statusLabels[draft.status]}</span>
            <h2 id="event-detail-title">Detail události</h2>
          </div>
          <button aria-label="Zavřít detail" onClick={onClose} type="button">
            <X aria-hidden="true" size={22} />
          </button>
        </header>

        <div className="detail-form">
          <TextField
            disabled={!editable}
            label="Název"
            value={draft.title}
            onChange={(value) => setDraft({ ...draft, title: value })}
          />
          <SelectField
            disabled={!editable}
            label="Prostor / tým"
            value={draft.resourceId}
            onChange={(value) => setDraft({ ...draft, resourceId: value as CalendarResourceId })}
            options={calendarResources.map((resource) => ({ value: resource.id, label: resource.label }))}
          />
          <SelectField
            disabled={!editable}
            label="Stav"
            value={draft.status}
            onChange={(value) => setDraft({ ...draft, status: value as CalendarStatus })}
            options={calendarStatuses.map((status) => ({ value: status, label: statusLabels[status] }))}
          />
          <TextField
            disabled={!editable}
            label="Začátek"
            type="datetime-local"
            value={draft.start}
            onChange={(value) => setDraft({ ...draft, start: value })}
          />
          <TextField
            disabled={!editable}
            label="Konec"
            type="datetime-local"
            value={draft.end}
            onChange={(value) => setDraft({ ...draft, end: value })}
          />
          <TextField disabled={!editable} label="Jméno" value={draft.contactName} onChange={(value) => setDraft({ ...draft, contactName: value })} />
          <TextField disabled={!editable} label="Kontakt" value={draft.contactValue} onChange={(value) => setDraft({ ...draft, contactValue: value })} />
          <label className="field field-wide">
            <span>Poznámka</span>
            <textarea
              disabled={!editable}
              value={draft.note}
              onChange={(input) => setDraft({ ...draft, note: input.target.value })}
              rows={4}
            />
          </label>
        </div>

        {editable && (
          <footer>
            <button className="delete-button" onClick={onDelete} type="button">
              <Trash2 aria-hidden="true" size={17} />
              Smazat
            </button>
            <button className="save-button" onClick={() => onSave(draft)} type="button">
              <Save aria-hidden="true" size={17} />
              Uložit změny
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  disabled = false,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  disabled = false,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getMonthGrid(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function getWeekDays(cursor: Date): Date[] {
  const start = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function createWeekLabel(date: Date): string {
  const days = getWeekDays(date);
  return `${dayFormatter.format(days[0]!)} - ${fullDateFormatter.format(days[6]!)}`;
}

function formatTimeRange(event: CalendarEvent): string {
  return `${event.start.slice(11, 16)}-${event.end.slice(11, 16)}`;
}

function toggleSet<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}
