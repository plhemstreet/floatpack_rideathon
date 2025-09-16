from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Modifier(Base):
    __tablename__ = "modifiers"
    
    id = Column(Integer, primary_key=True, index=True)
    multiplier = Column(Float, nullable=False)
    creator_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    start = Column(DateTime, nullable=True)
    end = Column(DateTime, nullable=True)
    
    # Relationships
    creator = relationship("Team", foreign_keys=[creator_id], back_populates="modifiers_created")
    receiver = relationship("Team", foreign_keys=[receiver_id], back_populates="modifiers_received")
    challenge = relationship("Challenge", back_populates="modifiers")