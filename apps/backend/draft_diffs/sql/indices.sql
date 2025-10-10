-- Proposed indices for hot paths

-- Attempts by user + time
CREATE INDEX IF NOT EXISTS idx_progress_user_time ON progress("userId", "createdAt");

-- Attempts by session + time
CREATE INDEX IF NOT EXISTS idx_progress_session_time ON progress("sessionId", "createdAt");

-- MCQ selection filters
CREATE INDEX IF NOT EXISTS idx_mcq_course_difficulty_type ON mcq("courseId", difficulty, type);

-- Adaptive learner lookup and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_adaptive_learner_user_course ON adaptive_learner("userId", "courseId");

