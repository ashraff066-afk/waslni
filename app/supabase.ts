import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nbxyrpyyecptsanqdzen.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieHlycHl5ZWNwdHNhbnFkemVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzQ1MzcsImV4cCI6MjA5NjIxMDUzN30.KrdeqXIUjMpVAVDrI6S_LSN4KW_PkcvkqICysmkvQqk";

export const supabase = createClient(supabaseUrl, supabaseKey);