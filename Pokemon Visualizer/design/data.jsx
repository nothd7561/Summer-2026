// data.jsx — loads & parses pokemon_normalized.csv, exposes helpers on window
(function () {
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = splitRow(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitRow(lines[i]);
      const obj = {};
      for (let j = 0; j < header.length; j++) obj[header[j]] = cells[j] ?? '';
      rows.push(obj);
    }
    return rows;
  }

  function splitRow(line) {
    const out = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  }

  function normalize(raw) {
    const num = parseInt(raw.pokedex_number, 10);
    return {
      number: num,
      name: raw.name,
      type1: raw.type_1 || '',
      type2: raw.type_2 || '',
      hp: +raw.hp, atk: +raw.attack, def: +raw.defense,
      spAtk: +raw.sp_attack, spDef: +raw.sp_defense, speed: +raw.speed,
      bst: +raw.base_stat_total,
      height: +raw.height_m, weight: +raw.weight_kg,
      baseXp: +raw.base_experience,
      abilities: (raw.abilities || '').split('|').filter(Boolean),
      hiddenAbility: raw.hidden_ability || '',
      generation: raw.generation,
      isLegendary: raw.is_legendary === 'True',
      isMythical: raw.is_mythical === 'True',
      isBaby: raw.is_baby === 'True',
      color: raw.color, shape: raw.shape,
      eggGroups: (raw.egg_groups || '').split('|').filter(Boolean),
      habitat: raw.habitat || 'unknown',
      growthRate: raw.growth_rate,
      captureRate: +raw.capture_rate,
      baseHappiness: +raw.base_happiness,
      genus: raw.genus,
      chainId: raw.evolution_chain_id,
      flavor: (raw.flavor_text || '').replace(/\s+/g, ' '),
      sprite: raw.sprite_url,
      hpN: +raw.hp_norm, atkN: +raw.atk_norm, defN: +raw.def_norm,
      spAtkN: +raw.sp_atk_norm, spDefN: +raw.sp_def_norm, speedN: +raw.speed_norm,
      isForm: num >= 10000,
    };
  }

  async function loadPokemon() {
    const r = await fetch('../pokemon_normalized.csv');
    const text = await r.text();
    const raw = parseCSV(text);
    const all = raw.map(normalize);
    // Build chain map keyed by chain_id, sorted by number
    const chains = {};
    for (const p of all) {
      if (!chains[p.chainId]) chains[p.chainId] = [];
      chains[p.chainId].push(p);
    }
    for (const cid in chains) {
      chains[cid].sort((a, b) => a.number - b.number);
    }
    return { all, chains };
  }

  // fuzzy: case-insensitive substring + small-edit tolerance via simple scoring
  function fuzzySearch(query, pool, limit = 8) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const p of pool) {
      if (p.isForm) continue;
      const n = p.name.toLowerCase();
      let score = -1;
      if (n === q) score = 1000;
      else if (n.startsWith(q)) score = 800 - (n.length - q.length);
      else if (n.includes(q)) score = 500 - n.indexOf(q);
      else {
        // simple subsequence match
        let i = 0, j = 0;
        while (i < n.length && j < q.length) {
          if (n[i] === q[j]) j++;
          i++;
        }
        if (j === q.length) score = 200 - n.length;
      }
      // also match dex number
      if (String(p.number) === q) score = 1200;
      if (score > 0) scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.p);
  }

  // Mainline chain (no mega/gmax forms) — used for ring count
  function mainlineChain(chain) {
    return chain.filter(p => !p.isForm);
  }

  // Format helpers
  function titleCase(s) {
    return s ? s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
  }

  window.PokeData = { loadPokemon, fuzzySearch, mainlineChain, titleCase };
})();
