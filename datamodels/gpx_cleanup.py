from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class GpxCleanup(Base):
    __tablename__ = "gpx_cleanups"
    
    id = Column(Integer, primary_key=True, index=True)
    gpx_upload_id = Column(Integer, ForeignKey("gpx_uploads.id"), nullable=False)
    total_distance = Column(Float, nullable=False)
    total_time = Column(Float, nullable=False)
    average_speed = Column(Float, nullable=False)
    max_speed = Column(Float, nullable=False)
    min_speed = Column(Float, nullable=False)
    scored_distance = Column(Float, nullable=False)
    pruned_distance_speed = Column(Float, nullable=False)
    pruned_distance_updated = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

    # Relationships
    gpx_upload = relationship("GpxUpload", back_populates="gpx_cleanups")