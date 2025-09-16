import dataclasses
from datetime import datetime
from datamodels.team import Team
from datamodels.challenge import Challenge

@dataclasses.dataclass
class Modifier:
    multiplier: float
    creator: str
    reciever: str
    created_at: datetime
    start: datetime
    end: datetime