// Mirrors backend/src/config/checklistTemplate.js. Duplicated (not shared
// via a package) because frontend and backend are independently
// deployable apps; used here for the offline/localStorage fallback path
// and for instant client-side progress calculations. Keep in sync.

export const CITIES = [
  "Bengaluru",
  "Pune",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export const OPS_TEAM = ["Anita", "Rohan", "Divya", "Karthik", "Meera"];

export const STATUSES = ["not_started", "in_progress", "blocked", "done"];

export const STATUS_META = {
  not_started: { label: "Not started", color: "var(--color-gray)", soft: "var(--color-gray-soft)" },
  in_progress: { label: "In progress", color: "var(--color-blue)", soft: "var(--color-blue-soft)" },
  blocked: { label: "Blocked", color: "var(--color-rust)", soft: "var(--color-rust-soft)" },
  done: { label: "Done", color: "var(--color-green)", soft: "var(--color-green-soft)" },
};

export const STALE_DAYS = 3;

export const DEFAULT_TEMPLATE = [
  {
    group: "Housing",
    items: [
      { key: "shortlist_sent", label: "Apartment shortlist sent" },
      { key: "viewings_done", label: "Viewings completed" },
      { key: "lease_signed", label: "Lease signed" },
    ],
  },
  {
    group: "Moving",
    items: [
      { key: "movers_booked", label: "Packers & movers booked" },
      { key: "move_day_confirmed", label: "Move day confirmed with vendor" },
    ],
  },
  {
    group: "Utilities",
    items: [
      { key: "electricity", label: "Electricity connected" },
      { key: "internet", label: "Internet connected" },
      { key: "gas", label: "Gas connected" },
      { key: "water", label: "Water connected" },
    ],
  },
  {
    group: "Documentation",
    items: [
      { key: "bank_address", label: "Bank address updated" },
      { key: "id_address", label: "ID / government address updated" },
      { key: "subscriptions", label: "Subscriptions & misc. updated" },
    ],
  },
  {
    group: "Settling In",
    items: [
      { key: "orientation_sent", label: "Local orientation sent" },
      { key: "checkin_7day", label: "7-day check-in done" },
    ],
  },
];

export const ALL_TEMPLATE_ITEMS = DEFAULT_TEMPLATE.flatMap((g, gi) =>
  g.items.map((item, ii) => ({ ...item, group: g.group, sortOrder: gi * 100 + ii }))
);

export const GROUP_ORDER = DEFAULT_TEMPLATE.map((g) => g.group);
