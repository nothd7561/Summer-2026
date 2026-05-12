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

  // edit distance (Levenshtein) for typo tolerance
  function editDist(a, b) {
    const m = a.length, n = b.length;
    const prev = Array.from({ length: n + 1 }, (_, j) => j);
    const curr = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++)
        curr[j] = a[i-1] === b[j-1] ? prev[j-1] : 1 + Math.min(prev[j], curr[j-1], prev[j-1]);
      for (let j = 0; j <= n; j++) prev[j] = curr[j];
    }
    return prev[n];
  }

  // fuzzy: exact → prefix → substring → subsequence → edit-distance fallback
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
        // subsequence match
        let i = 0, j = 0;
        while (i < n.length && j < q.length) {
          if (n[i] === q[j]) j++;
          i++;
        }
        if (j === q.length) score = 200 - n.length;
      }
      // edit-distance fallback for typos (e.g. "ghastly" → "Gastly")
      if (score < 0 && q.length >= 4) {
        const dist = editDist(n, q);
        const allowed = q.length <= 5 ? 1 : 2;
        if (dist <= allowed) score = 160 - dist * 40 - n.length;
      }
      // also match dex number
      if (String(p.number) === q) score = 1200;
      if (score > 0) scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.p);
  }

  // Mainline chain — filters to the direct evolutionary path of `active`.
  // For branching chains (e.g. Eevee's 8 evolutions), returns only
  // [base, ...sole-intermediates, active] rather than all siblings.
  function mainlineChain(chain, active) {
    const filtered = chain.filter(p => !p.isForm);
    if (!active || filtered.length <= 3) return filtered;
    filtered.sort((a, b) => {
      if (a.isBaby && !b.isBaby) return -1;
      if (!a.isBaby && b.isBaby) return 1;
      return a.number - b.number;
    });
    const activeIdx = filtered.findIndex(p => p.number === active.number);
    if (activeIdx === -1) return filtered;
    const before = filtered.slice(0, activeIdx + 1);
    if (before.length <= 3) return before;
    // Walk before[], collapsing sibling clusters (consecutive entries within 3 dex numbers)
    // into a single entry — keeping active if it falls in the cluster, else skipping.
    const path = [filtered[0]]; // base is always first
    let i = 1;
    while (i < before.length) {
      let clusterEnd = i;
      while (clusterEnd + 1 < before.length &&
             before[clusterEnd + 1].number - before[clusterEnd].number <= 3) {
        clusterEnd++;
      }
      if (clusterEnd > i) {
        const inCluster = before.slice(i, clusterEnd + 1).find(p => p.number === active.number);
        if (inCluster) path.push(inCluster);
      } else {
        path.push(before[i]);
      }
      i = clusterEnd + 1;
    }
    return path;
  }

  // Format helpers
  function titleCase(s) {
    return s ? s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
  }

  window.PokeData = { loadPokemon, fuzzySearch, mainlineChain, titleCase };
})();
