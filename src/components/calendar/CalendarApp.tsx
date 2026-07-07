import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  ListFilter,
  LockKeyhole,
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
  start: "2026-07-01T14:00",
  end: "2026-07-01T16:00",
  contactName: "Jan Novák",
  contactValue: "+420 777 123 456",
  note: "Nový ruční zápis do kalendáře.",
};

export default function CalendarApp({ mode = "public" }: CalendarAppProps) {
  const isAdmin = mode === "admin";
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date("2026-07-01T12:00:00"));
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
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsReady(true);
    let isMounted = true;

    async function loadEvents() {
      try {
        const response = await fetch("/api/calendar", { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { events?: CalendarEvent[] };
        if (isMounted && Array.isArray(payload.events)) {
          setEvents(payload.events);
          const firstRelevantDate = pickRelevantCalendarDate(payload.events);
          if (firstRelevantDate) {
            setCursor(firstRelevantDate);
            setDraft((current) => createDraftForDate(firstRelevantDate, current));
          }
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

  async function persistEvents(nextEvents: CalendarEvent[], successMessage: string): Promise<boolean> {
    const previousEvents = events;
    setEvents(nextEvents);

    if (!isAdmin) {
      setMessage(successMessage);
      return true;
    }

    setIsSaving(true);
    setMessage("Ukládám změny...");

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
      notifyCalendarUpdated();
      setMessage(successMessage);
      return true;
    } catch (error) {
      setEvents(previousEvents);
      setMessage(error instanceof Error ? error.message : "Kalendář se nepodařilo uložit.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function submitDraft() {
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
    const saved = await persistEvents(nextEvents, "Zápis přidán a uložen.");
    if (saved) {
      setSelectedId(null);
    }
  }

  async function updateSelectedEvent(updated: CalendarEvent) {
    if (!isAdmin) {
      return;
    }
    const resource = calendarResources.find((item) => item.id === updated.resourceId) ?? calendarResources[0];
    const normalized = { ...updated, resourceLabel: resource.label, resourceGroup: resource.group };
    const nextEvents = events.map((event) => (event.id === normalized.id ? normalized : event));
    const saved = await persistEvents(nextEvents, "Změna uložena.");
    if (saved) {
      setSelectedId(null);
    }
  }

  async function deleteSelectedEvent() {
    if (!selectedEvent || !isAdmin) {
      return;
    }
    const confirmed = window.confirm(`Opravdu smazat záznam „${selectedEvent.title}“? Tato změna se hned uloží do kalendáře.`);
    if (!confirmed) {
      return;
    }
    const nextEvents = events.filter((event) => event.id !== selectedEvent.id);
    const saved = await persistEvents(nextEvents, "Zápis odstraněn.");
    if (saved) {
      setSelectedId(null);
    }
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
    downloadXlsx(exportCalendarTemplateToXlsx(), "banik-rynholec-kalendar-rocni-sablona.xlsx");
    setMessage("Roční Excel šablona stažená.");
  }

  async function importFile(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const imported = await importCalendarEventsFromFile(file);
      const firstImportedDate = imported[0] ? new Date(imported[0].start) : null;
      const saved = await persistEvents(imported, `Importováno ${imported.length} zápisů z Excel/CSV souboru.`);
      if (saved) {
        setSelectedId(null);
        setQuery("");
        setView("month");
        setActiveResources(new Set(calendarResources.map((resource) => resource.id)));
        setActiveStatuses(new Set(calendarStatuses));
        if (firstImportedDate && !Number.isNaN(firstImportedDate.getTime())) {
          setCursor(firstImportedDate);
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import se nepodařil.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function resetData() {
    void persistEvents([], "Kalendář byl vyčištěn.");
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

            {isAdmin ? (
              <div className="calendar-actions">
                <button className="utility-button" onClick={exportTemplateXlsx} type="button">
                  <Download aria-hidden="true" size={17} />
                  Stáhnout roční šablonu
                </button>
                <button className="utility-button" onClick={() => fileInputRef.current?.click()} type="button">
                  <FileUp aria-hidden="true" size={17} />
                  Import Excel
                </button>
                <button className="utility-button" onClick={exportXlsx} type="button">
                  <Download aria-hidden="true" size={17} />
                  Export Excel
                </button>
                <button className="utility-button" disabled={isSaving} onClick={resetData} type="button">
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
            ) : (
              <div className="calendar-actions calendar-actions-public">
                <a className="utility-button calendar-admin-link" href="/admin">
                  <LockKeyhole aria-hidden="true" size={17} />
                  Administrace
                </a>
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
                <DraftForm draft={draft} isSaving={isSaving} onChange={setDraft} onSubmit={() => void submitDraft()} />
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
          isSaving={isSaving}
          onDelete={() => void deleteSelectedEvent()}
          onSave={(event) => void updateSelectedEvent(event)}
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
  isSaving,
  onChange,
  onSubmit,
}: {
  draft: EventDraft;
  isSaving: boolean;
  onChange: (draft: EventDraft) => void;
  onSubmit: () => void;
}) {
  const durationHours = getDurationHours(draft.start, draft.end);

  function updateStart(start: string) {
    onChange({ ...draft, start, end: addHoursToDateTime(start, durationHours) });
  }

  function updateDuration(hours: number) {
    onChange({ ...draft, end: addHoursToDateTime(draft.start, hours) });
  }

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
      <DateTimeField label="Začátek" value={draft.start} onChange={updateStart} />
      <DurationField value={durationHours} onChange={updateDuration} />
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
      <button className="save-button" disabled={isSaving} onClick={onSubmit} type="button">
        <Plus aria-hidden="true" size={18} />
        {isSaving ? "Ukládám..." : "Přidat zápis"}
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
  isSaving,
  onClose,
  onDelete,
  onSave,
}: {
  editable: boolean;
  event: CalendarEvent;
  isSaving: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const [draft, setDraft] = useState(event);
  const durationHours = getDurationHours(draft.start, draft.end);

  function updateStart(start: string) {
    setDraft({ ...draft, start, end: addHoursToDateTime(start, durationHours) });
  }

  function updateDuration(hours: number) {
    setDraft({ ...draft, end: addHoursToDateTime(draft.start, hours) });
  }

  return (
    <div className="event-overlay" role="presentation">
      <section aria-labelledby="event-detail-title" aria-modal="true" className="event-detail" role="dialog">
        <header>
          <div>
            <span className={`status-badge ${statusTone[draft.status]}`}>{statusLabels[draft.status]}</span>
            <h2 id="event-detail-title">Detail události</h2>
            {editable && <p className="detail-hint">Tady může admin záznam upravit, uložit nebo smazat.</p>}
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
          <DateTimeField disabled={!editable} label="Začátek" value={draft.start} onChange={updateStart} />
          <DurationField disabled={!editable} value={durationHours} onChange={updateDuration} />
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
            <button className="delete-button" disabled={isSaving} onClick={onDelete} type="button">
              <Trash2 aria-hidden="true" size={17} />
              {isSaving ? "Mazání..." : "Smazat"}
            </button>
            <button className="save-button" disabled={isSaving} onClick={() => onSave(draft)} type="button">
              <Save aria-hidden="true" size={17} />
              {isSaving ? "Ukládám..." : "Uložit změny"}
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

function DateTimeField({
  disabled = false,
  label,
  onChange,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [text, setText] = useState(() => formatCzechDateTime(value));

  useEffect(() => {
    setText(formatCzechDateTime(value));
  }, [value]);

  function commit(nextText: string) {
    const parsed = parseCzechDateTime(nextText);
    if (parsed) {
      onChange(parsed);
      setText(formatCzechDateTime(parsed));
      return;
    }
    setText(formatCzechDateTime(value));
  }

  return (
    <label className="field">
      <span>{label}</span>
      <input
        disabled={disabled}
        inputMode="numeric"
        onBlur={(event) => commit(event.target.value)}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);
          const parsed = parseCzechDateTime(nextText);
          if (parsed) {
            onChange(parsed);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit(event.currentTarget.value);
          }
        }}
        placeholder="01.07.2026 14:00"
        type="text"
        value={text}
      />
    </label>
  );
}

function DurationField({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <SelectField
      disabled={disabled}
      label="Délka"
      value={String(value)}
      onChange={(nextValue) => onChange(Number(nextValue))}
      options={Array.from({ length: 10 }, (_, index) => {
        const hours = index + 1;
        return { value: String(hours), label: `+${hours} h` };
      })}
    />
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

function pickRelevantCalendarDate(events: readonly CalendarEvent[]): Date | null {
  const dates = events
    .map((event) => dateFromInputDateTime(event.start))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dates.find((date) => date.getTime() >= today.getTime()) ?? dates[0] ?? null;
}

function createDraftForDate(date: Date, current: EventDraft = defaultDraft): EventDraft {
  const startDate = new Date(date);
  startDate.setHours(14, 0, 0, 0);
  const start = toInputDateTime(startDate);
  const duration = getDurationHours(current.start, current.end);
  return {
    ...current,
    start,
    end: addHoursToDateTime(start, duration),
  };
}

function formatCzechDateTime(value: string): string {
  const date = dateFromInputDateTime(value);
  if (!date) {
    return value;
  }
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseCzechDateTime(value: string): string | null {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const czechMatch = /^(\d{1,2})\.(\d{1,2})\.?\s*(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (czechMatch) {
    const [, day, month, year, hour, minute] = czechMatch;
    return datePartsToInputDateTime(Number(year), Number(month), Number(day), Number(hour), Number(minute));
  }

  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/.exec(trimmed);
  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch;
    return datePartsToInputDateTime(Number(year), Number(month), Number(day), Number(hour), Number(minute));
  }

  return null;
}

function getDurationHours(start: string, end: string): number {
  const startDate = dateFromInputDateTime(start);
  const endDate = dateFromInputDateTime(end);
  if (!startDate || !endDate) {
    return 2;
  }

  const diffHours = Math.round((endDate.getTime() - startDate.getTime()) / 3_600_000);
  return clampDuration(diffHours);
}

function addHoursToDateTime(start: string, hours: number): string {
  const startDate = dateFromInputDateTime(start) ?? new Date();
  const next = new Date(startDate);
  next.setHours(next.getHours() + clampDuration(hours), next.getMinutes(), 0, 0);
  return toInputDateTime(next);
}

function dateFromInputDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute] = match;
  return datePartsToDate(Number(year), Number(month), Number(day), Number(hour), Number(minute));
}

function datePartsToInputDateTime(year: number, month: number, day: number, hour: number, minute: number): string | null {
  const date = datePartsToDate(year, month, day, hour, minute);
  return date ? toInputDateTime(date) : null;
}

function datePartsToDate(year: number, month: number, day: number, hour: number, minute: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }
  return date;
}

function toInputDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clampDuration(hours: number): number {
  if (!Number.isFinite(hours)) {
    return 2;
  }
  return Math.min(10, Math.max(1, hours));
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function notifyCalendarUpdated() {
  try {
    window.localStorage.setItem("banik-calendar-updated", String(Date.now()));
    window.dispatchEvent(new Event("banik-calendar-updated"));
  } catch {
    // Local storage can be blocked; saving still succeeded on the server.
  }
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
