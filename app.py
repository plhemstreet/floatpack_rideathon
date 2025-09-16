import streamlit as st

home = st.Page("pages/home.py")
rules = st.Page("pages/rules.py")
scoreboard = st.Page("pages/scoreboard.py")
admin = st.Page("pages/admin.py")

pg = st.navigation([home,rules,scoreboard,admin])

pg.run()