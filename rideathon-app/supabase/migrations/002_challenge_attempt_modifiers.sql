-- Add index for challenge attempt modifiers
-- These are modifiers where creator_id is NULL (system-generated) and challenge_id is NOT NULL
CREATE INDEX idx_modifiers_challenge_attempt ON modifiers(challenge_id) 
WHERE creator_id IS NULL AND challenge_id IS NOT NULL;

-- Add a comment to clarify the purpose
COMMENT ON INDEX idx_modifiers_challenge_attempt IS 'Index for challenge attempt modifiers - system-generated modifiers specific to challenges';

-- Optional: Add a view to easily query challenge attempt modifiers
CREATE VIEW challenge_attempt_modifiers AS
SELECT 
    m.id,
    m.multiplier,
    m.challenge_id,
    m.created_at,
    m.start,
    m.end,
    c.name as challenge_name,
    c.description as challenge_description   
FROM modifiers m
JOIN challenges c ON m.challenge_id = c.id
WHERE m.creator_id IS NULL 
  AND m.challenge_id IS NOT NULL
  AND m.receiver_id IS NULL;

COMMENT ON VIEW challenge_attempt_modifiers IS 'View for challenge attempt modifiers - system-generated modifiers that apply to all teams for specific challenges';
