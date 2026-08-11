import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const releases = pgTable('releases', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  releaseYear: text('release_year'),
  coverImage: text('cover_image'),
  description: text('description'),
  publishedState: text('published_state').default('published'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tourEvents = pgTable('tour_events', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  venue: text('venue').notNull(),
  location: text('location').notNull(),
  status: text('status').notNull(),
  ticketUrl: text('ticket_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gallery = pgTable('gallery', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  order: integer('order').default(0),
  uploadedAt: text('uploaded_at'),
});

export const fans = pgTable('fans', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  country: text('country'),
  preferredPlatform: text('preferred_platform'),
  joinedAt: text('joined_at'),
});
