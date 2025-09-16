from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    members = Column(Text, nullable=False)  # JSON string of member names
    color = Column(String(20), nullable=False)
    secret_code = Column(String(50), unique=True, nullable=False)
    
    # Relationships
    challenges = relationship("Challenge", back_populates="team")
    modifiers_created = relationship("Modifier", foreign_keys="Modifier.creator_id", back_populates="creator")
    modifiers_received = relationship("Modifier", foreign_keys="Modifier.receiver_id", back_populates="receiver")
    offsets_created = relationship("Offset", foreign_keys="Offset.creator_id", back_populates="creator")
    offsets_received = relationship("Offset", foreign_keys="Offset.receiver_id", back_populates="receiver")
    gpx_uploads = relationship("GpxUpload", back_populates="team")
    scorecards = relationship("Scorecard", back_populates="team")