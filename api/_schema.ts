import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const licenses = pgTable('licenses', {
  id: text('id').primaryKey(),
  serial: text('serial').notNull().unique(),
  clientId: text('client_id').notNull().references(() => clients.id),
  issuedAt: text('issued_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  monthsDuration: integer('months_duration').notNull(),
  maxActivations: integer('max_activations').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const licenseActivations = pgTable('license_activations', {
  id: text('id').primaryKey(),
  licenseId: text('license_id').notNull().references(() => licenses.id),
  hardwareId: text('hardware_id').notNull(),
  machineName: text('machine_name').notNull().default(''),
  activatedAt: timestamp('activated_at').notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
});
