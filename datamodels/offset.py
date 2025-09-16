from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Offset(Base):
    __tablename__ = "offsets"
    
    id = Column(Integer, primary_key=True, index=True)
    distance = Column(Float, nullable=False)
    creator_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    
    # Relationships
    creator = relationship("Team", foreign_keys=[creator_id], back_populates="offsets_created")
    receiver = relationship("Team", foreign_keys=[receiver_id], back_populates="offsets_received")
    challenge = relationship("Challenge", back_populates="offsets")