CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`session_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`child_name` text NOT NULL,
	`child_key` text NOT NULL,
	`age` integer NOT NULL,
	`school` text NOT NULL,
	`parent_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`public_consent` integer DEFAULT 0 NOT NULL,
	`photo_consent` integer DEFAULT 0 NOT NULL,
	`consent_version` text NOT NULL,
	`created` text NOT NULL,
	`check_token` text NOT NULL,
	`checked_in` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `site_content`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `event_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_registration_owner` ON `registrations` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_registration_session` ON `registrations` (`session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_registration_duplicate` ON `registrations` (`event_id`,`owner_id`,`child_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_registration_token` ON `registrations` (`check_token`);--> statement-breakpoint
CREATE TABLE `result_history` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`rows` text NOT NULL,
	`uploaded` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `site_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_history_event` ON `result_history` (`event_id`);--> statement-breakpoint
CREATE TABLE `event_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`capacity` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `site_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_event` ON `event_sessions` (`event_id`);--> statement-breakpoint
ALTER TABLE `site_content` ADD `status` text DEFAULT 'closed' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_content` ADD `closing` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_content` ADD `reporting` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_content` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_content` ADD `contact` text DEFAULT '' NOT NULL;