from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class GpxUpload(Base):
    __tablename__ = "gpx_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    uploaded_at = Column(DateTime, nullable=False, default=datetime.now)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    gpx_data = Column(String, nullable=False)

    # Relationships
    team = relationship("Team", back_populates="gpx_uploads")