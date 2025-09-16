#!/usr/bin/env python3
"""
Unit tests for database models and sample data population
"""

import unittest
import json
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
from datamodels.team import Team
from datamodels.challenge import Challenge, ChallengeStatus
from datamodels.modifier import Modifier
from datamodels.offset import Offset


class TestDatabaseModels(unittest.TestCase):
    """Test database models and sample data creation"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test database"""
        # Use in-memory SQLite database for testing
        cls.engine = create_engine('sqlite:///:memory:', echo=False)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        
        # Create all tables
        Base.metadata.create_all(bind=cls.engine)
    
    def setUp(self):
        """Set up each test with a fresh database session"""
        self.db = self.SessionLocal()
    
    def tearDown(self):
        """Clean up after each test"""
        self.db.rollback()
        self.db.close()
    
    def test_create_teams(self):
        """Test creating team records"""
        # Create sample teams
        team1 = Team(
            name="Team Alpha",
            members=json.dumps(["Alice", "Bob"]),
            color="red",
            secret_code="ALPHA123"
        )
        
        team2 = Team(
            name="Team Beta",
            members=json.dumps(["Charlie", "Diana"]),
            color="blue",
            secret_code="BETA456"
        )
        
        self.db.add(team1)
        self.db.add(team2)
        self.db.commit()
        
        # Verify teams were created
        teams = self.db.query(Team).all()
        self.assertEqual(len(teams), 2)
        
        # Verify team data
        alpha_team = self.db.query(Team).filter(Team.name == "Team Alpha").first()
        self.assertIsNotNone(alpha_team)
        self.assertEqual(alpha_team.color, "red")
        self.assertEqual(alpha_team.secret_code, "ALPHA123")
        self.assertEqual(json.loads(alpha_team.members), ["Alice", "Bob"])
        
        beta_team = self.db.query(Team).filter(Team.name == "Team Beta").first()
        self.assertIsNotNone(beta_team)
        self.assertEqual(beta_team.color, "blue")
        self.assertEqual(beta_team.secret_code, "BETA456")
        self.assertEqual(json.loads(beta_team.members), ["Charlie", "Diana"])
    
    def test_create_challenges(self):
        """Test creating challenge records"""
        challenge1 = Challenge(
            name="Ropeadopee",
            description="Split players into two teams of two. Play tug of war.\nReward: 1 mile.",
            uuid="123e4567-e89b-12d3-a456-426614174000",
            latitude=40.7128,
            longitude=-74.0060,
            status=ChallengeStatus.AVAILABLE
        )
        
        challenge2 = Challenge(
            name="Babyshark",
            description="Record a video of all players singing the entirety of 'Baby Shark'.\nReward: 5 miles.",
            uuid="123e4567-e89b-12d3-a456-426614174001",
            latitude=34.0522,
            longitude=-118.2437,
            status=ChallengeStatus.AVAILABLE
        )
        
        self.db.add(challenge1)
        self.db.add(challenge2)
        self.db.commit()
        
        # Verify challenges were created
        challenges = self.db.query(Challenge).all()
        self.assertEqual(len(challenges), 2)
        
        # Verify challenge data
        rope_challenge = self.db.query(Challenge).filter(Challenge.name == "Ropeadopee").first()
        self.assertIsNotNone(rope_challenge)
        self.assertEqual(rope_challenge.status, ChallengeStatus.AVAILABLE)
        self.assertTrue(rope_challenge.pause_distance)
        self.assertEqual(rope_challenge.latitude, 40.7128)
        self.assertEqual(rope_challenge.longitude, -74.0060)
        
        shark_challenge = self.db.query(Challenge).filter(Challenge.name == "Babyshark").first()
        self.assertIsNotNone(shark_challenge)
        self.assertEqual(shark_challenge.status, ChallengeStatus.AVAILABLE)
    
    def test_create_modifiers(self):
        """Test creating modifier records with relationships"""
        # Create team first
        team = Team(
            name="Test Team",
            members=json.dumps(["Player1", "Player2"]),
            color="green",
            secret_code="TEST123"
        )
        self.db.add(team)
        self.db.flush()  # Get team ID
        
        # Create challenge
        challenge = Challenge(
            name="Test Challenge",
            description="A test challenge",
            uuid="test-uuid-123",
            latitude=0.0,
            longitude=0.0
        )
        self.db.add(challenge)
        self.db.flush()  # Get challenge ID
        
        # Create modifier
        modifier = Modifier(
            multiplier=1.5,
            creator_id=team.id,
            receiver_id=team.id,
            challenge_id=challenge.id,
            created_at=datetime.now()
        )
        self.db.add(modifier)
        self.db.commit()
        
        # Verify modifier was created with relationships
        saved_modifier = self.db.query(Modifier).first()
        self.assertIsNotNone(saved_modifier)
        self.assertEqual(saved_modifier.multiplier, 1.5)
        self.assertEqual(saved_modifier.creator_id, team.id)
        self.assertEqual(saved_modifier.receiver_id, team.id)
        self.assertEqual(saved_modifier.challenge_id, challenge.id)
        
        # Test relationships
        self.assertEqual(saved_modifier.creator.name, "Test Team")
        self.assertEqual(saved_modifier.receiver.name, "Test Team")
        self.assertEqual(saved_modifier.challenge.name, "Test Challenge")
    
    def test_create_offsets(self):
        """Test creating offset records with relationships"""
        # Create team first
        team = Team(
            name="Test Team",
            members=json.dumps(["Player1", "Player2"]),
            color="purple",
            secret_code="OFFSET123"
        )
        self.db.add(team)
        self.db.flush()  # Get team ID
        
        # Create challenge
        challenge = Challenge(
            name="Offset Challenge",
            description="A challenge for testing offsets",
            uuid="offset-uuid-456",
            latitude=10.0,
            longitude=20.0
        )
        self.db.add(challenge)
        self.db.flush()  # Get challenge ID
        
        # Create offset
        offset = Offset(
            distance=2.5,
            creator_id=team.id,
            receiver_id=team.id,
            challenge_id=challenge.id,
            created_at=datetime.now()
        )
        self.db.add(offset)
        self.db.commit()
        
        # Verify offset was created with relationships
        saved_offset = self.db.query(Offset).first()
        self.assertIsNotNone(saved_offset)
        self.assertEqual(saved_offset.distance, 2.5)
        self.assertEqual(saved_offset.creator_id, team.id)
        self.assertEqual(saved_offset.receiver_id, team.id)
        self.assertEqual(saved_offset.challenge_id, challenge.id)
        
        # Test relationships
        self.assertEqual(saved_offset.creator.name, "Test Team")
        self.assertEqual(saved_offset.receiver.name, "Test Team")
        self.assertEqual(saved_offset.challenge.name, "Offset Challenge")
    
    def test_challenge_status_transitions(self):
        """Test challenge status transitions and methods"""
        # Create team and challenge
        team = Team(
            name="Challenge Team",
            members=json.dumps(["Hero", "Sidekick"]),
            color="yellow",
            secret_code="HERO123"
        )
        self.db.add(team)
        self.db.flush()
        
        challenge = Challenge(
            name="Status Test Challenge",
            description="Testing status transitions",
            uuid="status-test-789",
            latitude=0.0,
            longitude=0.0,
            status=ChallengeStatus.AVAILABLE
        )
        self.db.add(challenge)
        self.db.flush()
        
        # Test starting a challenge
        self.assertEqual(challenge.status, ChallengeStatus.AVAILABLE)
        challenge.start_challenge(team.id)
        self.assertEqual(challenge.status, ChallengeStatus.ACTIVE)
        self.assertEqual(challenge.team_id, team.id)
        self.assertIsNotNone(challenge.start)
        
        # Test completing a challenge
        challenge.complete_challenge()
        self.assertEqual(challenge.status, ChallengeStatus.COMPLETED)
        self.assertIsNotNone(challenge.end)
        
        self.db.commit()
    
    def test_challenge_forfeit_with_penalties(self):
        """Test challenge forfeit with penalty creation"""
        # Create team and challenge
        team = Team(
            name="Forfeit Team",
            members=json.dumps(["Quitter", "Giver-Upper"]),
            color="gray",
            secret_code="QUIT123"
        )
        self.db.add(team)
        self.db.flush()
        
        challenge = Challenge(
            name="Forfeit Test Challenge",
            description="Testing forfeit functionality",
            uuid="forfeit-test-999",
            latitude=0.0,
            longitude=0.0,
            status=ChallengeStatus.ACTIVE,
            team_id=team.id
        )
        self.db.add(challenge)
        self.db.flush()
        
        # Test forfeiting a challenge
        initial_offset_count = self.db.query(Offset).count()
        challenge.forfeit_challenge(team.id, failure_penalty=3.0)
        
        self.assertEqual(challenge.status, ChallengeStatus.FORFEITED)
        self.assertIsNotNone(challenge.end)
        
        # Verify penalty offset was created
        final_offset_count = self.db.query(Offset).count()
        self.assertEqual(final_offset_count, initial_offset_count + 1)
        
        penalty_offset = self.db.query(Offset).filter(Offset.distance == 3.0).first()
        self.assertIsNotNone(penalty_offset)
        self.assertEqual(penalty_offset.creator_id, team.id)
        self.assertEqual(penalty_offset.receiver_id, team.id)
        
        self.db.commit()
    
    def test_populate_full_sample_data(self):
        """Test populating a complete set of sample data"""
        # Create teams
        teams_data = [
            {
                "name": "The Speedsters",
                "members": ["Flash", "Quicksilver", "Sonic"],
                "color": "red",
                "secret_code": "SPEED001"
            },
            {
                "name": "The Strategists",
                "members": ["Chess Master", "Tactician"],
                "color": "blue",
                "secret_code": "BRAIN002"
            },
            {
                "name": "The Wildcards",
                "members": ["Joker", "Random", "Chaos", "Unpredictable"],
                "color": "purple",
                "secret_code": "WILD003"
            }
        ]
        
        teams = []
        for team_data in teams_data:
            team = Team(
                name=team_data["name"],
                members=json.dumps(team_data["members"]),
                color=team_data["color"],
                secret_code=team_data["secret_code"]
            )
            self.db.add(team)
            teams.append(team)
        
        self.db.flush()
        
        # Create challenges
        challenges_data = [
            {
                "name": "Mountain Climb",
                "description": "Climb to the top of the nearest hill.\nReward: 3 miles.",
                "uuid": "mountain-climb-001",
                "latitude": 39.7392,
                "longitude": -104.9903
            },
            {
                "name": "Scavenger Hunt",
                "description": "Find 5 hidden items around the city.\nReward: 2 miles.",
                "uuid": "scavenger-hunt-002",
                "latitude": 40.7589,
                "longitude": -73.9851
            },
            {
                "name": "Dance Battle",
                "description": "Perform a 3-minute dance routine.\nReward: 1.5 miles.",
                "uuid": "dance-battle-003",
                "latitude": 34.0522,
                "longitude": -118.2437
            }
        ]
        
        challenges = []
        for challenge_data in challenges_data:
            challenge = Challenge(**challenge_data, status=ChallengeStatus.AVAILABLE)
            self.db.add(challenge)
            challenges.append(challenge)
        
        self.db.flush()
        
        # Create modifiers
        for i, (team, challenge) in enumerate(zip(teams, challenges)):
            modifier = Modifier(
                multiplier=1.0 + (i * 0.2),  # 1.0, 1.2, 1.4
                creator_id=team.id,
                receiver_id=team.id,
                challenge_id=challenge.id,
                created_at=datetime.now()
            )
            self.db.add(modifier)
        
        # Create offsets
        for i, (team, challenge) in enumerate(zip(teams, challenges)):
            offset = Offset(
                distance=1.0 + i,  # 1.0, 2.0, 3.0
                creator_id=team.id,
                receiver_id=team.id,
                challenge_id=challenge.id,
                created_at=datetime.now()
            )
            self.db.add(offset)
        
        self.db.commit()
        
        # Verify all data was created
        self.assertEqual(self.db.query(Team).count(), 3)
        self.assertEqual(self.db.query(Challenge).count(), 3)
        self.assertEqual(self.db.query(Modifier).count(), 3)
        self.assertEqual(self.db.query(Offset).count(), 3)
        
        # Verify relationships work
        first_team = teams[0]
        self.assertEqual(len(first_team.modifiers_created), 1)
        self.assertEqual(len(first_team.offsets_created), 1)
        
        first_challenge = challenges[0]
        self.assertEqual(len(first_challenge.modifiers), 1)
        self.assertEqual(len(first_challenge.offsets), 1)


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)
