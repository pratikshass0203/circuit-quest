// Insert all problem questions via Supabase REST API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://sjvafrfdjusfrdmgkziq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdmFmcmZkanVzZnJkbWdremlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTg3MTUsImV4cCI6MjA5OTQzNDcxNX0.TPd1WBLURwLFmtf-ZV3FH_FbFQG_-3q_MIdi0b_mjtk';

const supabase = createClient(supabaseUrl, supabaseKey);

const dir = path.join(__dirname, '..', 'tmp_sql');
const modules = ['gate-puzzler','circuit-builder','waveform-lab','power-quest','state-machine','cpu-boss'];

async function insertAll() {
  let totalInserted = 0;
  for (const mod of modules) {
    const content = fs.readFileSync(path.join(dir, 'problems2_' + mod + '.sql'), 'utf-8');
    // Parse the SQL to extract rows
    const stmts = content.split(/;\n(?=INSERT)/).filter(s => s.trim());
    for (const stmt of stmts) {
      // Extract the level from the first row
      const levelMatch = stmt.match(/'basic'|'intermediate'|'advanced'/);
      const level = levelMatch ? levelMatch[0].replace(/'/g, '') : 'basic';
      
      // Parse all rows from the INSERT statement
      const rowMatches = stmt.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']*)',\s*ARRAY\[([^\]]+)\],\s*(\d+),\s*'([^']*)',\s*(\d+)\)/g);
      const rows = [];
      for (const m of rowMatches) {
        const moduleId = m[1];
        const lvl = m[2];
        const question = m[3].replace(/''/g, "'");
        const optsStr = m[4];
        const opts = optsStr.split(',').map(o => o.trim().replace(/^'|'$/g, '').replace(/''/g, "'"));
        const correctIdx = parseInt(m[5]);
        const explanation = m[6].replace(/''/g, "'");
        const xp = parseInt(m[7]);
        rows.push({ module_id: moduleId, level: lvl, question, options: opts, correct_index: correctIdx, explanation, xp_reward: xp });
      }
      
      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { data, error } = await supabase.from('module_questions').insert(batch);
        if (error) {
          console.error(`Error inserting ${mod} ${level} batch ${i}:`, error.message);
        } else {
          totalInserted += batch.length;
        }
      }
    }
    console.log(`${mod}: inserted`);
  }
  console.log(`Total inserted: ${totalInserted}`);
}

insertAll().catch(console.error);
