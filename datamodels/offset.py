import dataclasses
from datetime import datetime
from datamodels.challenge import Challenge

@dataclasses.dataclass
class Offset:
    distance: float
    creator: str
    reciever: str
    created_at: datetime