import dataclasses
from datamodels.challenge import Challenge

@dataclasses.dataclass
class Team:
    name: str
    members: list[str]
    rank: int
    color: str
    description: str
    challenges: list[Challenge]
    secret_code: str

    