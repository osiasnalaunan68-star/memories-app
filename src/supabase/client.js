// src/supabase/client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpgkngudgobivqbzimis.supabase.co'
const supabaseKey = 'sb_publishable_juYJqXwWvb0vTsGA_ysxGQ_g3xZjE72'

export const supabase = createClient(supabaseUrl, supabaseKey)
