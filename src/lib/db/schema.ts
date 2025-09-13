import { pgTable, uuid, varchar, text, integer, timestamp, json, pgEnum } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Enums as specified in the assignment
export const cityEnum = pgEnum('city', ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'])
export const propertyTypeEnum = pgEnum('property_type', ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'])
export const bhkEnum = pgEnum('bhk', ['1', '2', '3', '4', 'Studio'])
export const purposeEnum = pgEnum('purpose', ['Buy', 'Rent'])
export const timelineEnum = pgEnum('timeline', ['0-3m', '3-6m', '>6m', 'Exploring'])
export const sourceEnum = pgEnum('source', ['Website', 'Referral', 'Walk-in', 'Call', 'Other'])
export const statusEnum = pgEnum('status', ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'])

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Buyers table (main leads table)
export const buyers = pgTable('buyers', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 80 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  city: cityEnum('city').notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  bhk: bhkEnum('bhk'), // Optional, only for Apartment/Villa
  purpose: purposeEnum('purpose').notNull(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  timeline: timelineEnum('timeline').notNull(),
  source: sourceEnum('source').notNull(),
  status: statusEnum('status').notNull().default('New'),
  notes: text('notes'),
  tags: json('tags').$type<string[]>(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Buyer history table for tracking changes
export const buyerHistory = pgTable('buyer_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id),
  changedBy: uuid('changed_by').notNull().references(() => users.id),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  diff: json('diff').$type<Record<string, { old: any; new: any }>>().notNull(),
})

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertBuyerSchema = createInsertSchema(buyers, {
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be at most 80 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  budgetMin: z.number().int().positive('Budget must be positive').optional(),
  budgetMax: z.number().int().positive('Budget must be positive').optional(),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    return false
  }
  return true
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // Budget max must be >= budget min if both present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false
  }
  return true
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
})

export const selectBuyerSchema = createSelectSchema(buyers)
export const updateBuyerSchema = insertBuyerSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date()
})

export const insertBuyerHistorySchema = createInsertSchema(buyerHistory)
export const selectBuyerHistorySchema = createSelectSchema(buyerHistory)

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Buyer = typeof buyers.$inferSelect
export type NewBuyer = typeof buyers.$inferInsert
export type UpdateBuyer = z.infer<typeof updateBuyerSchema>
export type BuyerHistory = typeof buyerHistory.$inferSelect
export type NewBuyerHistory = typeof buyerHistory.$inferInsert
