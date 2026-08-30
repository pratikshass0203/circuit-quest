// Insert remaining questions via Supabase client using JSON data
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://sjvafrfdjusfrdmgkziq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdmFmcmZkanVzZnJkbWdremlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTg3MTUsImV4cCI6MjA5OTQzNDcxNX0.TPd1WBLURwLFmtf-ZV3FH_FbFQG_-3q_MIdi0b_mjtk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Parse SQL INSERT statements into JSON objects, handling '' escaping
function parseSQLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const stmts = content.split(/;\n(?=INSERT)/).filter(s => s.trim());
  const rows = [];
  
  for (const stmt of stmts) {
    // Extract all value tuples using a character-by-character parser
    const valuesPart = stmt.replace(/^INSERT INTO module_questions \(.*?\) VALUES\s*/s, '');
    
    let i = 0;
    while (i < valuesPart.length) {
      // Find opening paren
      if (valuesPart[i] !== '(') { i++; continue; }
      
      // Parse the tuple
      let pos = i + 1;
      const tuple = {};
      
      // module_id
      const modId = readQuoted(valuesPart, pos);
      tuple.module_id = modId.val;
      pos = modId.pos + 1; // skip comma
      
      // level
      const level = readQuoted(valuesPart, pos);
      tuple.level = level.val;
      pos = level.pos + 1;
      
      // question
      const question = readQuoted(valuesPart, pos);
      tuple.question = question.val;
      pos = question.pos + 1;
      
      // ARRAY[...]
      const arrayStart = valuesPart.indexOf('ARRAY[', pos - 1);
      pos = arrayStart + 6;
      const options = [];
      for (let j = 0; j < 4; j++) {
        const opt = readQuoted(valuesPart, pos);
        options.push(opt.val);
        pos = opt.pos;
        if (j < 3) pos++; // skip comma
      }
      tuple.options = options;
      
      // Skip ] and ,
      pos = valuesPart.indexOf(']', pos) + 1;
      pos = valuesPart.indexOf(',', pos) + 1;
      while (valuesPart[pos] === ' ') pos++;
      
      // correct_index
      let numStr = '';
      while (/\d/.test(valuesPart[pos])) { numStr += valuesPart[pos]; pos++; }
      tuple.correct_index = parseInt(numStr);
      
      // skip comma
      pos = valuesPart.indexOf(',', pos) + 1;
      while (valuesPart[pos] === ' ') pos++;
      
      // explanation
      const expl = readQuoted(valuesPart, pos);
      tuple.explanation = expl.val;
      pos = expl.pos + 1;
      
      // xp_reward
      while (valuesPart[pos] === ' ') pos++;
      let xpStr = '';
      while (/\d/.test(valuesPart[pos])) { xpStr += valuesPart[pos]; pos++; }
      tuple.xp_reward = parseInt(xpStr);
      
      rows.push(tuple);
      
      // Skip to next tuple - find closing paren
      i = pos;
      // Skip semicolon, comma, newline
      while (i < valuesPart.length && /[;,\n)\s]/.test(valuesPart[i])) i++;
    }
  }
  return rows;
}

function readQuoted(str, start) {
  let pos = start;
  while (str[pos] === ' ') pos++;
  if (str[pos] !== "'") throw new Error('Expected quote at ' + pos);
  pos++;
  let val = '';
  while (pos < str.length) {
    if (str[pos] === "'" && str[pos + 1] === "'") {
      val += "'";
      pos += 2;
    } else if (str[pos] === "'") {
      pos++;
      break;
    } else {
      val += str[pos];
      pos++;
    }
  }
  return { val, pos };
}

async function main() {
  const dir = path.join(__dirname, '..', 'tmp_sql');
  const modules = ['gate-puzzler','circuit-builder','waveform-lab','power-quest','state-machine','cpu-boss'];
  let totalInserted = 0;
  
  for (const mod of modules) {
    const rows = parseSQLFile(path.join(dir, 'problems2_' + mod + '.sql'));
    console.log(`${mod}: parsed ${rows.length} rows`);
    
    // Verify correct_index is not null
    const valid = rows.filter(r => r.correct_index !== null && r.correct_index !== undefined && !isNaN(r.correct_index));
    console.log(`  ${valid.length} valid rows`);
    
    // Insert in batches of 25
    for (let i = 0; i < valid.length; i += 25) {
      const batch = valid.slice(i, i + 25);
      const { error } = await supabase.from('module_questions').insert(batch);
      if (error) {
        console.error(`  Error batch ${i}:`, error.message);
      } else {
        totalInserted += batch.length;
      }
    }
  }
  console.log(`Total inserted: ${totalInserted}`);
}

main().catch(console.error);
