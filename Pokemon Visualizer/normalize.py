import pandas as pd

#(X - X_min) / (X_max - X_min)

input_csv = r'C:\Users\lucas\Downloads\Code\Summer 2026\Pokemon Visualizer\pokemon_complete.csv'
stat = pd.read_csv(input_csv)

hp_list = stat["hp"].tolist()
attack_list = stat["attack"].tolist()   
defense_list = stat["defense"].tolist()
sp_attack_list = stat["sp_attack"].tolist()
sp_defense_list = stat["sp_defense"].tolist()
speed_list = stat["speed"].tolist()

print(max(hp_list), max(attack_list), max(defense_list), max(sp_attack_list), max(sp_defense_list), max(speed_list))
print(min(hp_list), min(attack_list), min(defense_list), min(sp_attack_list), min(sp_defense_list), min(speed_list))

norm_dict = dict()

for index, row in stat.iterrows():
    norm_hp = (row["hp"] - min(hp_list)) / (max(hp_list) - min(hp_list))
    norm_atk = (row["attack"] - min(attack_list)) / (max(attack_list) - min(attack_list))
    norm_def = (row["defense"] - min(defense_list)) / (max(defense_list) - min(defense_list))
    norm_sp_atk = (row["sp_attack"] - min(sp_attack_list)) / (max(sp_attack_list) - min(sp_attack_list))
    norm_sp_def = (row["sp_defense"] - min(sp_defense_list)) / (max(sp_defense_list) - min(sp_defense_list))
    norm_speed = (row["speed"] - min(speed_list)) / (max(speed_list) - min(speed_list))
    norm_dict["hp_norm"] = norm_hp
    norm_dict["atk_norm"] = norm_atk
    norm_dict["def_norm"] = norm_def
    norm_dict["sp_atk_norm"] = norm_sp_atk
    norm_dict["sp_def_norm"] = norm_sp_def
    norm_dict["speed_norm"] = norm_speed

new_df = pd.DataFrame(norm_dict, index=[0])
print(new_df)
