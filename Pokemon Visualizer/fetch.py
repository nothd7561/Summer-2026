import pandas as pd

input_csv = r'C:\Users\lucas\Downloads\Code\Summer 2026\Pokemon Visualizer\pokemon_complete.csv'
df = pd.read_csv(input_csv)

#if pokemon doesnt have 2nd type, fill with None string so filter doesnt break
df['type_2'] = df['type_2'].fillna("None")

#abilities was split by a line, now is a tuple
df["abilities"] = df["abilities"].str.split("|")

#converted the roman numeral generation to numerical
for index, row in df.iterrows():
    if row['generation'] == "gen-i":
        df.at[index, 'generation'] = "generation-1"
    if row['generation'] == "gen-ii":
        df.at[index, 'generation'] = "generation-2"
    if row['generation'] == "gen-iii":
        df.at[index, 'generation'] = "generation-3"
    if row['generation'] == "gen-iv":
        df.at[index, 'generation'] = "generation-4"
    if row['generation'] == "gen-v":
        df.at[index, 'generation'] = "generation-5"
    if row['generation'] == "gen-vi":
        df.at[index, 'generation'] = "generation-6"
    if row['generation'] == "gen-vii":
        df.at[index, 'generation'] = "generation-7"
    if row['generation'] == "gen-viii":
        df.at[index, 'generation'] = "generation-8"
    if row['generation'] == "gen-ix":
        df.at[index, 'generation'] = "generation-9"

#converted the true/false string under legendary,mythical columns to boolean values
df["is_legendary"] = df["is_legendary"].map({"TRUE": True, "FALSE": False})
df["is_mythical"] = df["is_mythical"].map({"TRUE": True, "FALSE": False})

df.to_csv(r'C:\Users\lucas\Downloads\Code\Side Projects\poke-api display\pokemon_revised.csv')

