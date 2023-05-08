import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", (table) => {
      table.text("id").primary()

      table.text("name").notNullable()
      table.text("email").notNullable()

      table.text("customer_id")
      table.boolean("subscribed").notNullable()

      table.unique(["customer_id"], undefined)
    })
    .createTable("sessions", (table) => {
      table.bigint("id").primary()
      table.text("user_id").notNullable()
      table.binary("selector", 32).notNullable()
      table.binary("validator", 32).notNullable()
      table.bigint("expires_at").notNullable()

      table.unique(["selector"], undefined)
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("users")
    .dropTable("sessions")
}
