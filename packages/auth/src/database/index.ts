import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as relations from "./relations";
import * as schema from "./schema";

const pg = postgres(process.env.DATABASE_URL!);

const db = drizzle(pg, {
  schema: {
    ...schema,
    ...relations,
  },
});

export default db;
