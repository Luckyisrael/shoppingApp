import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://glyphvymlbnjfqrpexjy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdseXBodnltbGJuamZxcnBleGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDA5ODQsImV4cCI6MjA2OTYxNjk4NH0.JcCUjTev5p1Po9LhbQv8ivBs7dkkv_0UHUahnKAmey8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

