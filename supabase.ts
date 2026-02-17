
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oancxlxjdstcahbfcqhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmN4bHhqZHN0Y2FoYmZjcWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODgxOTksImV4cCI6MjA4Njg2NDE5OX0.ETf6Bsm9ki5D5OLMiCkgI5FD0tDP96HrfL9JI7-rbWg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
