import streamlit as st
from models import Team
from database import SessionLocal

st.title("Float Pack Ride-a-thon")

st.header("Quick Reference")

st.text("""
Leon's Phone Number: 1-800-867-5309
""")

if st.session_state.get("team") is None:
    st.text_input("Team Name", key="team_name")
    st.text_input("Secret Code", key="secret_code")
    if st.button("Login"):
        # Query teams from database
        db = SessionLocal()
        try:
            teams = db.query(Team).all()
            
            # Check if login credentials match any team
            for team in teams:
                if team.name == st.session_state["team_name"] and team.secret_code == st.session_state["secret_code"]:
                    st.session_state["team"] = team
                    st.success(f"Welcome, {team.name}!")
                    st.rerun()
                    break
            else:
                st.error("Invalid team name or secret code")
        except Exception as e:
            st.error(f"Database error: {str(e)}")
        finally:
            db.close()
else:
    # User is logged in
    team = st.session_state["team"]
    st.success(f"Logged in as: {team.name}")
    st.write(f"**Members:** {team.members}")
    st.write(f"**Team Color:** {team.color}")
    
    if st.button("Logout"):
        del st.session_state["team"]
        st.rerun()

        
