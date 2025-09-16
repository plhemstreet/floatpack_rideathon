"""
Central models module that imports all data models to ensure proper SQLAlchemy relationship resolution.
This module should be imported whenever any data model is needed to avoid circular import issues.
"""

# Import all data models to ensure they're all available for SQLAlchemy relationship resolution
from datamodels.team import Team
from datamodels.challenge import Challenge, ChallengeStatus
from datamodels.modifier import Modifier
from datamodels.offset import Offset
from datamodels.gpx_upload import GpxUpload
from datamodels.scorecard import Scorecard

# Export all models for easy importing
__all__ = [
    'Team',
    'Challenge', 
    'ChallengeStatus',
    'Modifier',
    'Offset',
    'GpxUpload',
    'Scorecard'
]
