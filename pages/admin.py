import streamlit as st
from database import clear_database, populate_from_config, populate_from_yaml_content, get_database_status

st.title("Admin")

st.markdown("""
Here are some admin tools for managing the database.
""")

# Database Management Section
st.header("Database Management")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🗑️ Clear Database", type="secondary"):
        success, message = clear_database()
        if success:
            st.success(message)
        else:
            st.error(message)

with col2:
    if st.button("📄 Populate from config.yaml", type="primary"):
        success, message = populate_from_config()
        if success:
            st.success(message)
        else:
            st.error(message)

with col3:
    st.markdown("**Upload YAML File**")
    uploaded_file = st.file_uploader("Choose a YAML file", type=['yaml', 'yml'], key="yaml_upload")
    
    if uploaded_file is not None:
        if st.button("📤 Populate from Uploaded YAML", type="primary"):
            try:
                yaml_content = uploaded_file.read().decode('utf-8')
                success, message = populate_from_yaml_content(yaml_content)
                if success:
                    st.success(message)
                else:
                    st.error(message)
            except Exception as e:
                st.error(f"Error reading uploaded file: {str(e)}")

# Database Status Section
st.header("Database Status")

try:
    status = get_database_status()
    
    st.metric("Teams", status["teams"])
    st.metric("Challenges", status["challenges"])
    st.metric("Modifiers", status["modifiers"])
    st.metric("Offsets", status["offsets"])
    
except Exception as e:
    st.error(f"Error reading database status: {str(e)}")

