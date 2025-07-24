import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mymarket_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  confirmed: integer("confirmed").default(0),
  confirmationCode: varchar("confirmation_code", { length: 6 }),
  userType: varchar("user_type", { length: 10 }).notNull().default('oauth'),
  username: varchar("username").unique(),
});

export const products = createTable("products", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    desc: varchar("desc", { length: 500 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    imageUrls: varchar("image_url", { length: 500 }),
    category: varchar("category", { length: 255 }).notNull(),
    subcategory: varchar("subcategory", { length: 255 }), 
    createdById: varchar("created_by_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const recentSearches = createTable('recent_searches', {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  term: varchar("term", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const recentSearchesRelations = relations(recentSearches, ({ one }) => ({
  user: one(users, { fields: [recentSearches.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  createdBy: one(users, { fields: [products.createdById], references: [users.id] }),
}));

export const cart = createTable("cart", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  desc: varchar("desc", { length: 500 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
export const cartRelations = relations(cart, ({ one }) => ({
  product: one(products, { fields: [cart.productId], references: [products.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const conversations = createTable("conversations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  buyerId: varchar("buyer_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = createTable("messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
