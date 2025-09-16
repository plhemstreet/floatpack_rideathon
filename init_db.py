#!/usr/bin/env python3
"""
Database initialization script for Floatpack Rideathon
Creates tables and populates with initial data
"""

from database import create_tables, SessionLocal, engine
from datamodels.challenge import Challenge, ChallengeStatus
from datamodels.team import Team
from datamodels.modifier import Modifier
from datamodels.offset import Offset
import json

def init_database():
    """Initialize the database with tables and sample data"""
    print("Creating database tables...")
    create_tables()
    

if __name__ == "__main__":
    init_database()
