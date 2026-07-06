import { getStore } from "@netlify/blobs";

import {
  calendarResources,
  calendarStatuses,
  type CalendarEvent,
  type CalendarResource,
  type CalendarResourceId,
  type CalendarStatus,
} from "../../../src/content/calendar";

const calendarStore = "banik-calendar";
const calendarKey = "events";
const resourceById = new Map<CalendarResourceId, CalendarResource>(
  calendarResources.map((resource) => [resource.id, resource]),
);
const statuses = new Set<CalendarStatus>(calendarStatuses);

export function normalizeCalendarEventsForStorage(input: unknown): CalendarEvent[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item, index) => normalizeCalendarEvent(item, index))
    .filter((event): event is CalendarEvent => event !== null);
}

export async function readCalendarEventsFromStore(): Promise<CalendarEvent[]> {
  const store = getStore({ name: calendarStore, consistency: "strong" });
  const stored = await store.get(calendarKey, { type: "json" });
  return normalizeCalendarEventsForStorage(readStoredEvents(stored));
}

export async function writeCalendarEventsToStore(events: readonly CalendarEvent[]): Promise<CalendarEvent[]> {
  const normalized = normalizeCalendarEventsForStorage(events);
  const store = getStore({ name: calendarStore, consistency: "strong" });
  await store.setJSON(calendarKey, { events: normalized, updatedAt: new Date().toISOString() });
  return normalized;
}

function normalizeCalendarEvent(item: unknown, index: number): CalendarEvent | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const resourceId = readResourceId(record.resourceId);
  const status = readStatus(record.status);
  const start = readDateTime(record.start);
  const end = readDateTime(record.end);

  if (!resourceId || !status || !start || !end) {
    return null;
  }

  const resource = resourceById.get(resourceId) ?? calendarResources[0];
  const title = readString(record.title) || `${resource.label} ${status}`;

  return {
    id: readString(record.id) || `event-${Date.now()}-${index}`,
    title,
    resourceId: resource.id,
    resourceLabel: resource.label,
    resourceGroup: resource.group,
    status,
    start,
    end,
    contactName: readString(record.contactName) || "TJ Baník Rynholec",
    contactValue: readString(record.contactValue) || "info@banikrynholec.cz",
    note: readString(record.note) || "",
  };
}

function readStoredEvents(stored: unknown): unknown {
  if (Array.isArray(stored)) {
    return stored;
  }
  if (stored && typeof stored === "object" && Array.isArray((stored as { events?: unknown }).events)) {
    return (stored as { events: unknown }).events;
  }
  return [];
}

function readResourceId(value: unknown): CalendarResourceId | null {
  if (typeof value !== "string") {
    return null;
  }
  return resourceById.has(value as CalendarResourceId) ? (value as CalendarResourceId) : null;
}

function readStatus(value: unknown): CalendarStatus | null {
  if (typeof value !== "string") {
    return null;
  }
  return statuses.has(value as CalendarStatus) ? (value as CalendarStatus) : null;
}

function readDateTime(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().slice(0, 16);
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized) ? normalized : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
