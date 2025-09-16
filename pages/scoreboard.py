import streamlit as st
from models import Team, Scorecard
from database import SessionLocal
from sqlalchemy import desc, func
from datetime import datetime

st.title("Scoreboard")

# Get database session
db = SessionLocal()

try:
    # Get all teams
    teams = db.query(Team).all()
    
    if not teams:
        st.warning("No teams found in the database.")
    else:
        # Get the most recent scorecard for each team
        scoreboard_data = []
        oldest_created_at = None
        
        for team in teams:
            # Get the most recent scorecard for this team
            latest_scorecard = db.query(Scorecard).filter(
                Scorecard.team_id == team.id
            ).order_by(desc(Scorecard.created_at)).first()
            
            if latest_scorecard:
                scoreboard_data.append({
                    'team_name': team.name,
                    'team_color': team.color,
                    'challenges_completed': latest_scorecard.challenges_completed,
                    'distance_traveled': latest_scorecard.distance_traveled,
                    'distance_earned': latest_scorecard.distance_earned,
                    'last_updated': latest_scorecard.created_at
                })
                
                # Track the oldest created_at timestamp
                if oldest_created_at is None or latest_scorecard.created_at < oldest_created_at:
                    oldest_created_at = latest_scorecard.created_at
            else:
                # Team has no scorecards yet
                scoreboard_data.append({
                    'team_name': team.name,
                    'team_color': team.color,
                    'challenges_completed': 0,
                    'distance_traveled': 0.0,
                    'distance_earned': 0.0,
                    'last_updated': None
                })
        
        # Display last updated time
        if oldest_created_at:
            st.info(f"**Last Updated:** {oldest_created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            st.info("**Last Updated:** No scorecard data available")
        
        # Sort teams by challenges completed (descending), then by distance earned (descending)
        scoreboard_data.sort(key=lambda x: (x['challenges_completed'], x['distance_earned']), reverse=True)
        
        # Display scoreboard
        st.header("Team Rankings")
        
        for i, team_data in enumerate(scoreboard_data, 1):
            with st.container():
                col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
                
                with col1:
                    # Display team name with color indicator
                    st.markdown(f"**#{i} {team_data['team_name']}**")
                    st.markdown(f"<div style='width: 20px; height: 20px; background-color: {team_data['team_color']}; display: inline-block; border-radius: 3px;'></div>", unsafe_allow_html=True)
                
                with col2:
                    st.metric("Challenges", team_data['challenges_completed'])
                
                with col3:
                    st.metric("Distance Traveled", f"{team_data['distance_traveled']:.1f} mi")
                
                with col4:
                    st.metric("Distance Earned", f"{team_data['distance_earned']:.1f} mi")
                
                # Show last updated time for this team
                if team_data['last_updated']:
                    st.caption(f"Last updated: {team_data['last_updated'].strftime('%Y-%m-%d %H:%M:%S')}")
                else:
                    st.caption("No scorecard data")
                
                st.divider()

except Exception as e:
    st.error(f"Error loading scoreboard: {str(e)}")
finally:
    db.close()
