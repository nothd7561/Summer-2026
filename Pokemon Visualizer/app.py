import streamlit as st
import pandas as pd
from plotting import make_radar_chart
from rapidfuzz import process

# load the normalized CSV which contains raw stats + normalized stat columns
df = pd.read_csv(r'C:\Users\lucas\Downloads\Code\Summer 2026\Pokemon Visualizer\pokemon_normalized.csv')

st.title("Pokemon Visualizer")

# dropdown populated with every Pokemon name in the dataset
selection = st.selectbox("Select a Pokemon", df["name"].tolist())

if st.button("Visualize"):
    # pull the selected Pokemon's full row
    row = df[df["name"] == selection].iloc[0]

    st.subheader(row['name'])

    # display the 6 raw stats across 3 columns
    col1, col2, col3 = st.columns(3)
    col1.metric("HP", int(row["hp"]))
    col1.metric("Attack", int(row["attack"]))
    col2.metric("Defense", int(row["defense"]))
    col2.metric("Sp. Attack", int(row["sp_attack"]))
    col3.metric("Sp. Defense", int(row["sp_defense"]))
    col3.metric("Speed", int(row["speed"]))

    # build and render the radar chart using normalized stats from plotting.py
    radar = make_radar_chart(row)
    st.plotly_chart(radar)
