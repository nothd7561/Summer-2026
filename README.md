<div align="center">
Summer 2026
Stuff I built over the summer — trying to get better at data science and actually have something to show for it by the time recruiting season hits.

</div>

What's In Here
ProjectDescriptionStatus🎮 Pokémon Stat VisualizerPokédex-inspired stat explorer for newer players🔨 In progress⚡ Pokémon Team OptimizerInteger programming team builder for Gen 4 OU🔨 In progress🎵 Spotify VisualizerPersonal listening data explorer with taste clustering📋 July🛰️ Nighttime Lights × Economic ActivityNASA satellite data pipeline + geospatial dashboard📋 August

Projects
🎮 Pokémon Stat Visualizer
Interactive explorer for looking at Pokémon stats — built for people who are newer to the game and just want to understand what makes a Pokémon good. Going for a Pokédex-meets-minimalist aesthetic with the design: dark theme, scan animations, clean type breakdowns.
Stack: React · Vite · Recharts · PapaParse
Data:  800+ Pokémon · 37 features · normalized stats · sprite URLs

⚡ Pokémon Team Optimizer
Separate project — uses integer programming to build optimal Gen 4 OU teams from Smogon usage data. Assigns role labels (sweeper, wall, support) based on stat distributions and formulates team composition as an IP problem. Kept deliberately separate from the visualizer since it's competitive-focused.
Stack: Python · PuLP · Pandas
Data:  Smogon Gen 4 OU usage stats
