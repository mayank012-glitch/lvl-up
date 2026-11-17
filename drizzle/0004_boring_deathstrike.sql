CREATE TABLE `station_details` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tag` text NOT NULL,
	`image` text NOT NULL,
	`alt` text NOT NULL,
	`description` text NOT NULL,
	`steps` text NOT NULL,
	`focus` text NOT NULL,
	`safety` text NOT NULL,
	`age_values` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL
);
