#!/usr/bin/env python3
"""
Database initialization script for Floatpack Rideathon
Creates tables and populates with initial data from YAML config file
"""

from database import create_tables, SessionLocal, engine
from datamodels.challenge import Challenge, ChallengeStatus
from datamodels.team import Team
from datamodels.modifier import Modifier
from datamodels.offset import Offset
import yaml
import os

def load_config(config_file="config.yaml"):
    """Load configuration from YAML file"""
    if not os.path.exists(config_file):
        raise FileNotFoundError(f"Config file {config_file} not found")
    
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

def init_database():
    """Initialize the database with tables and data from config file"""
    print("Creating database tables...")
    create_tables()
    
    print("Loading configuration...")
    config = load_config()
    
    print("Populating database with teams and challenges...")
    db = SessionLocal()
    
    try:
        # Create teams
        teams = []
        for team_data in config["teams"]:
            team = Team(
                name=team_data["name"],
                members=team_data["members"],
                color=team_data["color"],
                secret_code=team_data["secret_code"]
            )
            db.add(team)
            teams.append(team)
        
        # Commit teams to get their IDs
        db.commit()
        
        # Create challenges - one row for each team-challenge combination
        challenges_created = 0
        for challenge_data in config["challenges"]:
            for team in teams:
                challenge = Challenge(
                    name=challenge_data["name"],
                    description=challenge_data["description"],
                    pause_distance=challenge_data["pause_distance"],
                    latitude=challenge_data["latitude"],
                    longitude=challenge_data["longitude"],
                    status=ChallengeStatus.AVAILABLE,
                    team_id=team.id
                )
                db.add(challenge)
                challenges_created += 1
        
        # Commit all challenges
        db.commit()
        
        print(f"Successfully created {len(teams)} teams and {challenges_created} challenges")
        print(f"Teams: {[team.name for team in teams]}")
        print(f"Challenge combinations: {len(config['challenges'])} challenges × {len(teams)} teams = {challenges_created} total rows")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
