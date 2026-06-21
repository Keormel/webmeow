
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INT NOT NULL,
    token_cost INT NOT NULL DEFAULT 2
);


CREATE TABLE IF NOT EXISTS activity_bookings (
    activity_id VARCHAR(50) NOT NULL,
    visitor_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (activity_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS visitors (
    id VARCHAR(50) PRIMARY KEY,
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    token_balance INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS token_credits (
    reservation_id VARCHAR(100) PRIMARY KEY,
    visitor_id VARCHAR(50) NOT NULL,
    amount INT NOT NULL
);

INSERT INTO activities (id, name, description, capacity, token_cost) VALUES
('ACT001', 'Beach Volleyball', 'Competitive beach volleyball tournament.', 20, 2),
('ACT002', 'Surf Lessons', 'Beginner-friendly surf training session.', 15, 5),
('ACT003', 'Snorkeling Adventure', 'Explore underwater marine life.', 12, 6),
('ACT004', 'Sunrise Yoga', 'Morning yoga on the beach.', 25, 2),
('ACT005', 'Kayaking Tour', 'Guided kayaking along the coastline.', 10, 4),
('ACT006', 'Sandcastle Competition', 'Build the ultimate sandcastle.', 30, 1),
('ACT007', 'Beach Soccer', 'Friendly soccer matches on the sand.', 22, 2),
('ACT008', 'Scuba Diving', 'Discover deeper ocean wonders.', 8, 9),
('ACT009', 'Jet Ski Experience', 'High-speed water adventure.', 1, 10),
('ACT010', 'Beach Bonfire', 'Evening gathering with music and snacks.', 40, 3),
('ACT011', 'Fishing Excursion', 'Learn fishing techniques with experts.', 10, 5),
('ACT012', 'Paddle Boarding', 'Relaxing paddle board session.', 14, 4),
('ACT013', 'Nature Walk', 'Guided tour of local flora and fauna.', 18, 1),
('ACT014', 'Photography Workshop', 'Capture stunning beach landscapes.', 16, 3),
('ACT015', 'Treasure Hunt', 'Family-friendly beach treasure hunt.', 25, 2),
('ACT016', 'Cooking Class', 'Learn to prepare local seafood dishes.', 12, 4),
('ACT017', 'Sailing Basics', 'Introduction to sailing techniques.', 10, 5),
('ACT018', 'Beach Cleanup', 'Community environmental activity.', 50, 1),
('ACT019', 'Meditation Session', 'Relaxing guided meditation by the sea.', 20, 2),
('ACT020', 'Sunset Cruise', 'Boat cruise during sunset hours.', 15, 7);
