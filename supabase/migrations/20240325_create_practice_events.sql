-- Create practice_events table
CREATE TABLE IF NOT EXISTS practice_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sheet_music_id UUID REFERENCES sheet_music(id) ON DELETE SET NULL,
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS practice_events_user_id_idx ON practice_events(user_id);
CREATE INDEX IF NOT EXISTS practice_events_start_time_idx ON practice_events(start_time);

-- Enable row level security
ALTER TABLE practice_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own practice events
CREATE POLICY "Users can read own practice events"
  ON practice_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own practice events
CREATE POLICY "Users can insert own practice events"
  ON practice_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own practice events
CREATE POLICY "Users can update own practice events"
  ON practice_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own practice events
CREATE POLICY "Users can delete own practice events"
  ON practice_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column automatically
CREATE TRIGGER update_practice_events_updated_at
  BEFORE UPDATE ON practice_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 