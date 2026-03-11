import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(__dirname, "../supabase/migrations/20260318000000_create_books_table.sql"),
  "utf8"
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { error } = await supabase.rpc("exec_sql", { sql_text: sql }).catch(() => ({ error: null }));
if (error) {
  console.error("RPC failed, manually run the SQL in Supabase dashboard.");
  console.log(sql);
} else {
  console.log("✅ books migration applied.");
}
