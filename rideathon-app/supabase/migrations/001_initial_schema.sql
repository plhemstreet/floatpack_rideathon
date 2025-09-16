-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    members TEXT NOT NULL,
    color VARCHAR(20) NOT NULL,
    secret_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_secret_code ON teams(secret_code);

-- Challenges table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    pause_distance BOOLEAN NOT NULL DEFAULT true,
    start TIMESTAMP WITH TIME ZONE,
    "end" TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'forfeited','pending', 'complete')),
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_challenges_uuid ON challenges(uuid);
CREATE INDEX idx_challenges_team_id ON challenges(team_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Modifiers table
CREATE TABLE modifiers (
    id SERIAL PRIMARY KEY,
    multiplier DOUBLE PRECISION NOT NULL,
    creator_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start TIMESTAMP WITH TIME ZONE,
    "end" TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_modifiers_creator_id ON modifiers(creator_id);
CREATE INDEX idx_modifiers_receiver_id ON modifiers(receiver_id);
CREATE INDEX idx_modifiers_challenge_id ON modifiers(challenge_id);

-- Offsets table
CREATE TABLE offsets (
    id SERIAL PRIMARY KEY,
    distance DOUBLE PRECISION NOT NULL,
    creator_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_offsets_creator_id ON offsets(creator_id);
CREATE INDEX idx_offsets_receiver_id ON offsets(receiver_id);
CREATE INDEX idx_offsets_challenge_id ON offsets(challenge_id);

-- GPX Uploads table
CREATE TABLE gpx_uploads (
    id SERIAL PRIMARY KEY,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    gpx_data TEXT NOT NULL
);

-- Create index
CREATE INDEX idx_gpx_uploads_team_id ON gpx_uploads(team_id);

-- GPX Cleanups table
CREATE TABLE gpx_cleanups (
    id SERIAL PRIMARY KEY,
    gpx_upload_id INTEGER NOT NULL REFERENCES gpx_uploads(id) ON DELETE CASCADE,
    total_distance DOUBLE PRECISION NOT NULL,
    total_time DOUBLE PRECISION NOT NULL,
    average_speed DOUBLE PRECISION NOT NULL,
    max_speed DOUBLE PRECISION NOT NULL,
    min_speed DOUBLE PRECISION NOT NULL,
    scored_distance DOUBLE PRECISION NOT NULL,
    pruned_distance_speed DOUBLE PRECISION NOT NULL,
    pruned_distance_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_gpx_cleanups_gpx_upload_id ON gpx_cleanups(gpx_upload_id);

-- Scorecards table
CREATE TABLE scorecards (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenges_completed INTEGER NOT NULL DEFAULT 0,
    distance_traveled DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    distance_earned DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scorecards_team_id ON scorecards(team_id);
CREATE INDEX idx_scorecards_created_at ON scorecards(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpx_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpx_cleanups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON challenges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON modifiers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON offsets FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gpx_uploads FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gpx_cleanups FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON scorecards FOR SELECT USING (true);

-- For write operations, you'll want to add authentication-based policies
-- Enable insert access for all users (for development)
CREATE POLICY "Enable insert access for all users" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON modifiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON offsets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON gpx_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON gpx_cleanups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users" ON scorecards FOR INSERT WITH CHECK (true);

-- Enable update access for all users (for development)
CREATE POLICY "Enable update access for all users" ON teams FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON challenges FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON modifiers FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON offsets FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON gpx_uploads FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON gpx_cleanups FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON scorecards FOR UPDATE USING (true);

-- Create views for easier querying
CREATE VIEW team_scores AS
SELECT 
    t.id,
    t.name,
    t.color,
    t.members,
    COALESCE(s.challenges_completed, 0) as challenges_completed,
    COALESCE(s.distance_traveled, 0) as distance_traveled,
    COALESCE(s.distance_earned, 0) as distance_earned,
    s.created_at as last_updated
FROM teams t
LEFT JOIN LATERAL (
    SELECT * FROM scorecards 
    WHERE team_id = t.id 
    ORDER BY created_at DESC 
    LIMIT 1
) s ON true;

-- Create function to get active challenges for a team
CREATE OR REPLACE FUNCTION get_team_challenges(team_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(200),
    description TEXT,
    uuid UUID,
    pause_distance BOOLEAN,
    start TIMESTAMP WITH TIME ZONE,
    "end" TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20)
) AS $$
BEGIN

    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.uuid,
        c.pause_distance,
        c.start,
        c.end,
        c.latitude,
        c.longitude,
        c.status
    FROM challenges c
    WHERE c.team_id = team_id_param
    ORDER BY 
        CASE c.status 
            WHEN 'active' THEN 1
            WHEN 'available' THEN 2
            WHEN 'completed' THEN 3
            WHEN 'forfeited' THEN 4
        END,
        c.name;
END;
$$ LANGUAGE plpgsql;