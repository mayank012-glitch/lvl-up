// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, index, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
export const content = sqliteTable("site_content", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull().default(""),
  city: text("city").notNull().default(""),
  dates: text("dates").notNull().default("[]"),
  date: text("date").notNull().default(""),
  image: text("image").notNull(),
  created: text("created").notNull(),
  status: text("status").notNull().default("closed"),
  closing: text("closing").notNull().default(""),
  reporting: text("reporting").notNull().default(""),
  address: text("address").notNull().default(""),
  contact: text("contact").notNull().default(""),
}, table => [index("idx_site_content_image").on(table.image)]);
export const resultUploads = sqliteTable("event_results", {
  eventId: text("event_id").primaryKey().references(()=>content.id,{onDelete:"cascade"}),
  rows: text("rows").notNull(),
  uploaded: text("uploaded").notNull(),
});

export const sessions = sqliteTable("event_sessions", {
 id:text("id").primaryKey(), eventId:text("event_id").notNull().references(()=>content.id),
 date:text("date").notNull(), time:text("time").notNull(), capacity:integer("capacity").notNull(),
},t=>[index("idx_sessions_event").on(t.eventId)]);
export const registrations = sqliteTable("registrations", {
 id:text("id").primaryKey(), eventId:text("event_id").notNull().references(()=>content.id),
 sessionId:text("session_id").notNull().references(()=>sessions.id), ownerId:text("owner_id").notNull(),
 childName:text("child_name").notNull(), childKey:text("child_key").notNull(), age:integer("age").notNull(), school:text("school").notNull(),
 parentName:text("parent_name").notNull(), phone:text("phone").notNull(), email:text("email").notNull(),
 publicConsent:integer("public_consent").notNull().default(0), photoConsent:integer("photo_consent").notNull().default(0),
 consentVersion:text("consent_version").notNull(), created:text("created").notNull(),
 checkToken:text("check_token").notNull(), checkedIn:text("checked_in").notNull().default(""),
},t=>[index("idx_registration_owner").on(t.ownerId),index("idx_registration_session").on(t.sessionId),uniqueIndex("idx_registration_duplicate").on(t.eventId,t.ownerId,t.childKey),uniqueIndex("idx_registration_token").on(t.checkToken)]);
export const resultHistory = sqliteTable("result_history", {
 id:text("id").primaryKey(),eventId:text("event_id").notNull().references(()=>content.id),
 rows:text("rows").notNull(),uploaded:text("uploaded").notNull(),actor:text("actor").notNull(),action:text("action").notNull(),
},t=>[index("idx_history_event").on(t.eventId)]);

export const stationDetails = sqliteTable("station_details", {
 id:text("id").primaryKey(),
 title:text("title").notNull(),tag:text("tag").notNull(),image:text("image").notNull(),
 alt:text("alt").notNull(),description:text("description").notNull(),steps:text("steps").notNull(),
 focus:text("focus").notNull(),safety:text("safety").notNull(),values:text("age_values").notNull(),
 revision:integer("revision").notNull().default(1),updated:text("updated").notNull(),
});
