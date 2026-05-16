import pandas as pd

# min-max normalization formula: (X - X_min) / (X_max - X_min)
# scales each stat to a 0-1 range relative to all pokemon in the dataset

input_csv = r'C:\Users\lucas\Downloads\Code\Summer 2026\Pokemon Visualizer\pokemon_complete.csv'
stat = pd.read_csv(input_csv)

# pull each stat column into a list so we can compute min/max once
hp_list = stat["hp"].tolist()
attack_list = stat["attack"].tolist()
defense_list = stat["defense"].tolist()
sp_attack_list = stat["sp_attack"].tolist()
sp_defense_list = stat["sp_defense"].tolist()
speed_list = stat["speed"].tolist()

# sanity check: print the range for each stat
print(max(hp_list), max(attack_list), max(defense_list), max(sp_attack_list), max(sp_defense_list), max(speed_list))
print(min(hp_list), min(attack_list), min(defense_list), min(sp_attack_list), min(sp_defense_list), min(speed_list))

# normalize each stat and write the result back into the dataframe as new columns
for index, row in stat.iterrows():
    stat.at[index, "hp_norm"] = (row["hp"] - min(hp_list)) / (max(hp_list) - min(hp_list))
    stat.at[index, "atk_norm"] = (row["attack"] - min(attack_list)) / (max(attack_list) - min(attack_list))
    stat.at[index, "def_norm"] = (row["defense"] - min(defense_list)) / (max(defense_list) - min(defense_list))
    stat.at[index, "sp_atk_norm"] = (row["sp_attack"] - min(sp_attack_list)) / (max(sp_attack_list) - min(sp_attack_list))
    stat.at[index, "sp_def_norm"] = (row["sp_defense"] - min(sp_defense_list)) / (max(sp_defense_list) - min(sp_defense_list))
    stat.at[index, "speed_norm"] = (row["speed"] - min(speed_list)) / (max(speed_list) - min(speed_list))

stat.to_csv(r'C:\Users\lucas\Downloads\Code\Summer 2026\Pokemon Visualizer\pokemon_normalized.csv', index=False)