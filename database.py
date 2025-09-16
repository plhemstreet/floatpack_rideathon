from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from uuid import uuid4
import uuid
import yaml
import os

# Database setup
engine = create_engine('sqlite:///test.db', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database operation functions
def clear_database():
    """Clear all data from the database"""
    try:
        db = SessionLocal()
        
        # Import from models to ensure all relationships are resolved
        from models import Team, Challenge, Modifier, Offset
        
        # Delete all records from all tables
        db.query(Offset).delete()
        db.query(Modifier).delete()
        db.query(Challenge).delete()
        db.query(Team).delete()
        
        db.commit()
        db.close()
        
        return True, "Database cleared successfully"
    except Exception as e:
        return False, f"Error clearing database: {str(e)}"

def populate_from_config(config_file="config.yaml"):
    """Populate database from config.yaml file"""
    try:
        if not os.path.exists(config_file):
            return False, f"{config_file} file not found"
        
        with open(config_file, 'r') as f:
            config = yaml.safe_load(f)
        
        return populate_from_yaml_data(config, source="config.yaml")
        
    except Exception as e:
        return False, f"Error reading {config_file}: {str(e)}"

def populate_from_yaml_content(yaml_content):
    """Populate database from YAML content string"""
    try:
        config = yaml.safe_load(yaml_content)
        return populate_from_yaml_data(config, source="uploaded YAML")
        
    except yaml.YAMLError as e:
        return False, f"Invalid YAML format: {str(e)}"
    except Exception as e:
        return False, f"Error parsing YAML content: {str(e)}"

def populate_from_yaml_data(config, source="YAML"):
    """Populate database from parsed YAML data"""
    try:
        # Import from models to ensure all relationships are resolved
        from models import Team, Challenge, ChallengeStatus
        
        # Validate config structure
        if "teams" not in config or "challenges" not in config:
            return False, "Invalid YAML structure. Must contain 'teams' and 'challenges' sections"
        
        db = SessionLocal()
        
        # Create teams
        teams = []
        for team_data in config["teams"]:
            if not all(key in team_data for key in ["name", "members", "color", "secret_code"]):
                return False, "Invalid team data. Each team must have 'name', 'members', 'color', and 'secret_code'"
            
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
            if not all(key in challenge_data for key in ["name", "description", "pause_distance", "latitude", "longitude"]):
                return False, "Invalid challenge data. Each challenge must have 'name', 'description', 'pause_distance', 'latitude', and 'longitude'"
            
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
        db.close()
        
        return True, f"Successfully created {len(teams)} teams and {challenges_created} challenges from {source}"
        
    except Exception as e:
        return False, f"Error populating from {source}: {str(e)}"

def get_database_status():
    """Get current database status with counts of all entities"""
    try:
        db = SessionLocal()
        
        # Import from models to ensure all relationships are resolved
        from models import Team, Challenge, Modifier, Offset
        
        team_count = db.query(Team).count()
        challenge_count = db.query(Challenge).count()
        modifier_count = db.query(Modifier).count()
        offset_count = db.query(Offset).count()
        
        db.close()
        
        return {
            "teams": team_count,
            "challenges": challenge_count,
            "modifiers": modifier_count,
            "offsets": offset_count
        }
        
    except Exception as e:
        raise Exception(f"Error reading database status: {str(e)}")
