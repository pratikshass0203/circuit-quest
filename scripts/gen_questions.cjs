// Generates SQL INSERT for 50 questions per module per level (900 total)
const fs = require('fs');
const path = require('path');

const mods = ['gate-puzzler','circuit-builder','waveform-lab','power-quest','state-machine','cpu-boss'];
const levels = ['basic','intermediate','advanced'];
const xp = { basic: 10, intermediate: 15, advanced: 20 };

let values = '';
let total = 0;

for (const mod of mods) {
  const bank = require(path.join(__dirname, 'questions', `${mod}.cjs`));
  for (const lvl of levels) {
    const arr = bank[lvl].slice(0, 50);
    if (arr.length < 50) {
      console.error(`WARNING: ${mod}.${lvl} has only ${arr.length} questions (need 50)`);
    }
    for (const item of arr) {
      const [question, o0, o1, o2, o3, correct_index, explanation] = item;
      const esc = s => String(s).replace(/'/g, "''");
      const opts = `'${esc(o0)}','${esc(o1)}','${esc(o2)}','${esc(o3)}'`;
      values += `('${mod}','${lvl}','${esc(question)}',ARRAY[${opts}],${correct_index},'${esc(explanation)}',${xp[lvl]}),\n`;
      total++;
    }
  }
}

// Remove trailing comma+newline
values = values.trimEnd().replace(/,$/, '');

const sql = `INSERT INTO module_questions (module_id, level, question, options, correct_index, explanation, xp_reward) VALUES\n${values};\n`;
fs.writeFileSync(path.join(__dirname, 'insert_questions.sql'), sql);
console.log(`Generated ${total} questions`);
