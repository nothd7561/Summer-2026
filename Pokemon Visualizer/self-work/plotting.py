import plotly.express as px
import pandas as pd
import streamlit as st

def make_radar_chart(row):
    radar_df = pd.DataFrame({'stat': ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"],
                            'value': [row["hp_norm"], row["atk_norm"], row["def_norm"], row["sp_atk_norm"], row["sp_def_norm"], row["speed_norm"]]})
    fig = px.line_polar(radar_df, r='value', theta='stat', line_close=True)
    fig.update_traces(fill='toself')
    return fig