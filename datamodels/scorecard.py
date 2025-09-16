from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Scorecard(Base):
    __tablename__ = "scorecards"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    challenges_completed = Column(Integer, nullable=False, default=0)
    distance_traveled = Column(Float, nullable=False, default=0.0)
    distance_earned = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, nullable=False, default=datetime.now)


    # Relationships
    team = relationship("Team", back_populates="scorecards")