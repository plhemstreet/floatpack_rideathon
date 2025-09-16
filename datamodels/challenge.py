import dataclasses
from uuid import UUID
from datetime import datetime
from typing import Literal
from datamodels.modifier import Modifier
from datamodels.offset import Offset



ChallengeStatus = Literal["available", "active", "completed", "forfeited"]

@dataclasses.dataclass
class Challenge:
    name: str
    description: str
    uuid: UUID 
    pause_distance: bool = True
    start: datetime = None
    end: datetime = None
    coordinates: tuple[float, float]
    modifiers: list[Modifier]
    offsets: list[Offset]
    status: ChallengeStatus = "available"


    def start_challenge(self, team: str):
        self.status = "active"
        self.start = datetime.now()
        if self.pause_distance:
            challenge_attempt_modifier = Modifier(
                multiplier=0,
                creator=team,
                reciever=team,
            )
            self.modifiers.append(challenge_attempt_modifier)

    def complete_challenge(self):
        self.status = "completed"
        self.end = datetime.now()
        if self.pause_distance:
            self.modifiers[0].end = datetime.now()
    
    def forfeit_challenge(self, team: str, failure_penalty: float = 5, bonus_offsets: list[Offset] = [], bonus_modifiers: list[Modifier] = []):
        self.status = "forfeited"
        self.end = datetime.now()
        if self.pause_distance:
            self.modifiers[0].end = datetime.now()

        failure_penalty = Offset(
            distance=failure_penalty,
            creator=team,
            reciever=team,
            created_at=datetime.now(),
        )
        self.offsets.append(failure_penalty)

        for offset in bonus_offsets:
            self.offsets.append(offset)
        for modifier in bonus_modifiers:
            self.modifiers.append(modifier)
        
        

ropeadopee = Challenge(
    name="Ropeadopee",
    description="Split players into two teams of two. Play tug of war.\nReward: 1 mile.",
    uuid=UUID("123e4567-e89b-12d3-a456-426614174000"),
    coordinates=(0, 0),
)

babyshark = Challenge(
    name="Babyshark",
    description="Record a video of all players singing the entirety of 'Baby Shark'.\nReward: 5 miles.",
    uuid=UUID("123e4567-e89b-12d3-a456-426614174001"),
    coordinates=(0, 0),
)

challenge_template = [ropeadopee, babyshark]