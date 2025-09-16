import streamlit as st
from datamodels.team import Team

st.title("Float Pack Ride-a-thon")

st.header("Quick Reference")

st.text("""
Leon's Phone Number: 1-800-867-5309
""")

team_1 = Team(
    name="Team 1",
    members=["Member 1", "Member 2", "Member 3"],
    rank=1,
    color="red",
    logo="https://via.placeholder.com/150",
    description="Team 1 Description",
    secret_code="123456"
)

teams = [team_1]

if st.session_state.get("team") is None:
    st.text_input("Team Name", key="team_name")
    st.text_input("Secret Code", key="secret_code")
    if st.button("Login"):
        for team in teams:
            if team.name == st.session_state["team_name"] and team.secret_code == st.session_state["secret_code"]:
                st.session_state["team"] = team
                break
        else:
            st.error("Invalid team name or secret code")

        
