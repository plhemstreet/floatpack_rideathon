from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid
import enum

class ChallengeStatus(enum.Enum):
    AVAILABLE = "available"
    ACTIVE = "active"
    COMPLETED = "completed"
    FORFEITED = "forfeited"

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    pause_distance = Column(Boolean, nullable=False, default=True)
    start = Column(DateTime, nullable=True)
    end = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    status = Column(Enum(ChallengeStatus), nullable=False, default=ChallengeStatus.AVAILABLE)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Relationships
    team = relationship("Team", back_populates="challenges")
    modifiers = relationship("Modifier", back_populates="challenge")
    offsets = relationship("Offset", back_populates="challenge")

    def start_challenge(self, team_id: int, db_session=None):
        self.status = ChallengeStatus.ACTIVE
        self.start = datetime.now()
        self.team_id = team_id
        if self.pause_distance:
            from datamodels.modifier import Modifier
            challenge_attempt_modifier = Modifier(
                multiplier=0,
                creator_id=self.team_id,
                receiver_id=self.team_id,
                challenge_id=self.id,
                start=datetime.now(),
            )
            if db_session:
                db_session.add(challenge_attempt_modifier)
                db_session.flush()  # Get the ID
            self.modifiers.append(challenge_attempt_modifier)

    def complete_challenge(self, db_session=None):
        self.status = ChallengeStatus.COMPLETED
        self.end = datetime.now()
        if self.pause_distance and self.modifiers:
            # Find the challenge attempt modifier (multiplier=0)
            challenge_attempt_modifier = next((m for m in self.modifiers if m.multiplier == 0), None)
            if challenge_attempt_modifier:
                challenge_attempt_modifier.end = datetime.now()
            if db_session:
                db_session.commit()
    
    def forfeit_challenge(self, db_session, failure_penalty: float = 5, bonus_offsets: list = [], bonus_modifiers: list = []):
        self.status = ChallengeStatus.FORFEITED
        self.end = datetime.now()
        if self.pause_distance and self.modifiers:
            # Find the challenge attempt modifier (multiplier=0)
            challenge_attempt_modifier = next((m for m in self.modifiers if m.multiplier == 0), None)
            if challenge_attempt_modifier:
                challenge_attempt_modifier.end = datetime.now()
            if db_session:
                db_session.commit()

        from datamodels.offset import Offset
        failure_penalty_offset = Offset(
            distance=failure_penalty,
            creator_id=self.team_id,
            receiver_id=self.team_id,
            challenge_id=self.id,
            created_at=datetime.now(),
        )
        self.offsets.append(failure_penalty_offset)
        for offset in bonus_offsets:
            self.offsets.append(offset)
        for modifier in bonus_modifiers:
            self.modifiers.append(modifier)
        if db_session:
            db_session.commit()






