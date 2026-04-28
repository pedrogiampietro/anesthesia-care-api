import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 40 }).default('admin').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 160 }).notNull(),
    description: text('description'),
    sku: varchar('sku', { length: 80 }),
    category: varchar('category', { length: 80 }).default('geral').notNull(),
    unit: varchar('unit', { length: 40 }).default('unidade').notNull(),
    priceCents: integer('price_cents').default(0).notNull(),
    stockQuantity: numeric('stock_quantity', { precision: 12, scale: 2 }).default('0').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('products_user_sku_unique').on(table.userId, table.sku)],
);

export const medications = pgTable('medications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 160 }).notNull(),
  genericName: varchar('generic_name', { length: 160 }),
  category: varchar('category', { length: 80 }).notNull(),
  concentration: varchar('concentration', { length: 80 }).notNull(),
  dosageForm: varchar('dosage_form', { length: 80 }),
  route: varchar('route', { length: 80 }),
  unit: varchar('unit', { length: 40 }).default('mL').notNull(),
  minDose: numeric('min_dose', { precision: 10, scale: 3 }),
  maxDose: numeric('max_dose', { precision: 10, scale: 3 }),
  doseUnit: varchar('dose_unit', { length: 60 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 160 }).notNull(),
  age: integer('age').notNull(),
  weight: numeric('weight', { precision: 7, scale: 2 }).notNull(),
  height: numeric('height', { precision: 7, scale: 2 }).notNull(),
  sex: char('sex', { length: 1 }).notNull(),
  asa: varchar('asa', { length: 20 }).default('ASA I').notNull(),
  notes: text('notes'),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  medications: many(medications),
  patients: many(patients),
}));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type Patient = typeof patients.$inferSelect;
