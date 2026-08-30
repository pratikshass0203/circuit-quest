// Insert problem questions using JSON output from generator
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Import the generator functions by requiring the module
// We need to modify the generator to export JSON data

const supabaseUrl = 'https://sjvafrfdjusfrdmgkziq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdmFmcmZkanVzZnJkbWdremlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTg3MTUsImV4cCI6MjA5OTQzNDcxNX0.TPd1WBLURwLFmtf-ZV3FH_FbFQG_-3q_MIdi0b_mjtk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Instead of parsing SQL, let's directly generate the question data in JS
// and insert via the Supabase client

function sqlEscape(s) { return String(s).replace(/'/g, "''"); }

function generateQuestions() {
  const modules = {};
  
  // We'll use the same generator functions but output JSON
  // Since the generator is in gen_problem_questions.cjs, let's just re-run it
  // but capture the data instead of writing SQL
  
  // Actually, let's just use a simpler approach: 
  // Read the SQL files and use a simpler regex that handles the escaped quotes
  
  const fs = require('fs');
  const dir = path.join(__dirname, '..', 'tmp_sql');
  const modNames = ['gate-puzzler','circuit-builder','waveform-lab','power-quest','state-machine','cpu-boss'];
  
  for (const mod of modNames) {
    const content = fs.readFileSync(path.join(dir, 'problems2_' + mod + '.sql'), 'utf-8');
    // Split into individual INSERT statements
    const stmts = content.split(/;\n(?=INSERT)/).filter(s => s.trim());
    for (const stmt of stmts) {
      // Extract level from the statement
      const levelMatch = stmt.match(/'(basic|intermediate|advanced)'/);
      const level = levelMatch ? levelMatch[1] : 'basic';
      
      // Parse rows using a simpler approach: split by "),(" 
      // But we need to be careful with ARRAY[...] which contains commas
      // Let's use a different approach: match the pattern for each row
      
      // Remove the INSERT header
      const valuesPart = stmt.replace(/^INSERT INTO module_questions \(.*\) VALUES\s*/, '').trim();
      
      // Split into individual tuples, being careful about ARRAY[...]
      const tuples = [];
      let depth = 0;
      let current = '';
      let inQuote = false;
      let i = 0;
      
      while (i < valuesPart.length) {
        const ch = valuesPart[i];
        if (ch === "'" && valuesPart[i+1] === "'") {
          current += "''";
          i += 2;
          continue;
        }
        if (ch === "'") {
          inQuote = !inQuote;
        }
        if (!inQuote) {
          if (ch === '[') depth++;
          if (ch === ']') depth--;
          if (ch === '(' && depth === 0 && current.trim()) {
            // New tuple starts
            depth = 0;
          }
          if (ch === ')' && depth === 0) {
            current += ch;
            // Check if next is comma or end
            tuples.push(current.trim());
            current = '';
            // Skip comma
            if (valuesPart[i+1] === ',') i++;
            if (valuesPart[i+1] === '\n') i++;
            i++;
            continue;
          }
        }
        current += ch;
        i++;
      }
      
      for (const tuple of tuples) {
        if (!tuple.startsWith('(')) continue;
        // Parse the tuple: ('mod','level','question',ARRAY['a','b','c','d'],idx,'explanation',xp)
        try {
          // Extract module_id
          let pos = 1;
          const modId = readString(tuple, pos);
          pos = modId.nextPos + 1; // skip comma
          
          const lvl = readString(tuple, pos);
          pos = lvl.nextPos + 1;
          
          const question = readString(tuple, pos);
          pos = question.nextPos + 1;
          
          // Skip ARRAY[
          const arrayStart = tuple.indexOf('ARRAY[', pos - 1);
          pos = arrayStart + 6;
          
          const options = [];
          for (let j = 0; j < 4; j++) {
            const opt = readString(tuple, pos);
            options.push(opt.value);
            pos = opt.nextPos + 1; // skip comma
          }
          
          // Skip ] and comma
          pos = tuple.indexOf(']', pos) + 1;
          pos = tuple.indexOf(',', pos) + 1;
          
          // Skip whitespace
          while (tuple[pos] === ' ') pos++;
          
          // Read correct_index
          let numStr = '';
          while (/\d/.test(tuple[pos])) { numStr += tuple[pos]; pos++; }
          const correctIdx = parseInt(numStr);
          
          // Skip comma
          pos = tuple.indexOf(',', pos) + 1;
          while (tuple[pos] === ' ') pos++;
          
          const explanation = readString(tuple, pos);
          pos = explanation.nextPos + 1;
          
          // Read xp_reward
          while (tuple[pos] === ' ') pos++;
          let xpStr = '';
          while (/\d/.test(tuple[pos])) { xpStr += tuple[pos]; pos++; }
          const xp = parseInt(xpStr);
          
          if (!modules[modId.value]) modules[modId.value] = [];
          modules[modId.value].push({
            module_id: modId.value,
            level: lvl.value,
            question: question.value,
            options,
            correct_index: correctIdx,
            explanation: explanation.value,
            xp_reward: xp
          });
        } catch (e) {
          // Skip unparseable
        }
      }
    }
  }
  
  return modules;
}

function readString(str, start) {
  let pos = start;
  while (str[pos] === ' ') pos++;
  if (str[pos] !== "'") throw new Error('Expected quote at ' + pos + ' in: ' + str.substring(pos, pos+20));
  pos++;
  let value = '';
  while (pos < str.length) {
    if (str[pos] === "'" && str[pos + 1] === "'") {
      value += "'";
      pos += 2;
    } else if (str[pos] === "'") {
      pos++;
      break;
    } else {
      value += str[pos];
      pos++;
    }
  }
  return { value, nextPos: pos };
}

async function insertAll() {
  const modules = generateQuestions();
  let totalInserted = 0;
  
  for (const [modId, rows] of Object.entries(modules)) {
    console.log(`${modId}: ${rows.length} rows parsed`);
    
    // Insert in batches of 25
    for (let i = 0; i < rows.length; i += 25) {
      const batch = rows.slice(i, i + 25);
      const { data, error } = await supabase.from('module_questions').insert(batch);
      if (error) {
        console.error(`Error inserting ${modId} batch ${i}:`, error.message);
      } else {
        totalInserted += batch.length;
      }
    }
  }
  console.log(`Total inserted: ${totalInserted}`);
}

insertAll().catch(console.error);
