// Insert all problem questions via Supabase REST API - v2 with better parsing
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://sjvafrfdjusfrdmgkziq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdmFmcmZkanVzZnJkbWdremlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTg3MTUsImV4cCI6MjA5OTQzNDcxNX0.TPd1WBLURwLFmtf-ZV3FH_FbFQG_-3q_MIdi0b_mjtk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Instead of parsing SQL, let's modify the generator to produce JSON directly
// For now, let's use a different approach: generate JSON from the question banks

// Re-require the generator functions by evaluating the question generation
// We'll parse the SQL more carefully this time

function parseSQLInsert(sql) {
  const rows = [];
  // Match each value tuple: ('mod','level','question',ARRAY[...],idx,'explanation',xp)
  // Use a more robust parser that handles '' escaping
  const lines = sql.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('(')) continue;
    // Remove trailing comma or semicolon
    let trimmed = line.trim().replace(/[,$];?\s*$/, '');
    if (trimmed.endsWith(';')) trimmed = trimmed.slice(0, -1);
    if (trimmed.endsWith(',')) trimmed = trimmed.slice(0, -1);
    
    // Use a state machine to parse the tuple
    // Format: ('val1','val2','val3',ARRAY['a','b','c','d'],num,'val4',num)
    try {
      // Extract module_id (first quoted string)
      let pos = 1; // skip (
      const moduleId = extractQuoted(trimmed, pos);
      pos = moduleId.nextPos + 1; // skip comma
      
      const level = extractQuoted(trimmed, pos);
      pos = level.nextPos + 1;
      
      const question = extractQuoted(trimmed, pos);
      pos = question.nextPos + 1;
      
      // Skip ARRAY[
      pos = trimmed.indexOf('ARRAY[', pos - 1) + 6;
      const options = [];
      for (let i = 0; i < 4; i++) {
        const opt = extractQuoted(trimmed, pos);
        options.push(opt.value);
        pos = opt.nextPos + 1; // skip comma
      }
      // Skip ]
      pos = trimmed.indexOf(']', pos) + 1;
      // Skip comma
      pos = trimmed.indexOf(',', pos) + 1;
      
      // Extract correct_index
      while (trimmed[pos] === ' ') pos++;
      let numStr = '';
      while (/\d/.test(trimmed[pos])) { numStr += trimmed[pos]; pos++; }
      const correctIdx = parseInt(numStr);
      
      // Skip comma
      pos = trimmed.indexOf(',', pos) + 1;
      while (trimmed[pos] === ' ') pos++;
      
      const explanation = extractQuoted(trimmed, pos);
      pos = explanation.nextPos + 1;
      
      // Extract xp_reward
      while (trimmed[pos] === ' ') pos++;
      let xpStr = '';
      while (/\d/.test(trimmed[pos])) { xpStr += trimmed[pos]; pos++; }
      const xp = parseInt(xpStr);
      
      rows.push({
        module_id: moduleId.value,
        level: level.value,
        question: question.value,
        options,
        correct_index: correctIdx,
        explanation: explanation.value,
        xp_reward: xp
      });
    } catch (e) {
      // Skip unparseable lines
    }
  }
  return rows;
}

function extractQuoted(str, start) {
  // Skip whitespace
  let pos = start;
  while (str[pos] === ' ') pos++;
  if (str[pos] !== "'") throw new Error('Expected quote at ' + pos);
  pos++; // skip opening quote
  let value = '';
  while (pos < str.length) {
    if (str[pos] === "'" && str[pos + 1] === "'") {
      value += "'";
      pos += 2;
    } else if (str[pos] === "'") {
      pos++; // skip closing quote
      break;
    } else {
      value += str[pos];
      pos++;
    }
  }
  return { value, nextPos: pos };
}

const dir = path.join(__dirname, '..', 'tmp_sql');
const modules = ['gate-puzzler','circuit-builder','waveform-lab','power-quest','state-machine','cpu-boss'];

async function insertAll() {
  let totalInserted = 0;
  for (const mod of modules) {
    const content = fs.readFileSync(path.join(dir, 'problems2_' + mod + '.sql'), 'utf-8');
    const rows = parseSQLInsert(content);
    console.log(`${mod}: parsed ${rows.length} rows`);
    
    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { data, error } = await supabase.from('module_questions').insert(batch);
      if (error) {
        console.error(`Error inserting ${mod} batch ${i}:`, error.message);
      } else {
        totalInserted += batch.length;
      }
    }
  }
  console.log(`Total inserted: ${totalInserted}`);
}

insertAll().catch(console.error);
