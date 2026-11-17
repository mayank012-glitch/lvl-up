CREATE TABLE `event_results` (
	`event_id` text PRIMARY KEY NOT NULL,
	`rows` text NOT NULL,
	`uploaded` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `site_content`(`id`) ON UPDATE no action ON DELETE cascade
);
