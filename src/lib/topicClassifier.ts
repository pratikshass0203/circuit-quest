export interface TopicDef {
  topic: string;
  keywords: string[];
}

const TOPIC_RULES: TopicDef[] = [
  { topic: 'K-Map', keywords: ['k-map', 'kmap', 'karnaugh', 'k map'] },
  { topic: 'Logic Gates', keywords: ['and gate', 'or gate', 'not gate', 'xor gate', 'nand gate', 'nor gate', 'xnor gate', 'and(', 'or(', 'not(', 'xor(', 'nand(', 'nor(', 'logic gate', 'truth table'] },
  { topic: 'Boolean Algebra', keywords: ['boolean', 'demorgan', "de morgan", 'sum of products', 'product of sums', 'sop', 'pos', 'minterm', 'maxterm', 'complement', 'absorption', 'associative', 'commutative', 'distributive', 'involution'] },
  { topic: 'Combinational Circuits', keywords: ['multiplexer', 'mux', 'demultiplexer', 'demux', 'decoder', 'encoder', 'comparator', 'adder', 'subtractor', 'half adder', 'full adder', 'ripple', 'carry-lookahead', 'carry-select', 'carry skip', 'alu', 'arithmetic logic'] },
  { topic: 'Sequential Circuits', keywords: ['flip-flop', 'flip flop', 'latch', 'register', 'shift register', 'counter', 'synchronous', 'asynchronous', 'clock', 'edge-triggered', 'd flip', 't flip', 'jk flip', 'sr flip'] },
  { topic: 'Finite State Machines', keywords: ['state machine', 'fsm', 'moore', 'mealy', 'state diagram', 'transition', 'mealy machine', 'moore machine', 'state table', 'state assignment', 'state reduction'] },
  { topic: 'Memory', keywords: ['ram', 'rom', 'prom', 'eprom', 'eeprom', 'flash memory', 'sram', 'dram', 'cache', 'memory cell', 'memory array', 'word line', 'bit line', 'address decoder'] },
  { topic: 'ADC / DAC', keywords: ['adc', 'dac', 'analog-to-digital', 'digital-to-analog', 'sample-and-hold', 'sample and hold', 'quantization', 'nyquist', 'aliasing', 'anti-aliasing', 'oversampling', 'flash adc', 'successive approximation', 'dual-slope', 'sigma-delta', 'resolution'] },
  { topic: 'Op-Amp', keywords: ['op-amp', 'op amp', 'operational amplifier', 'inverting', 'non-inverting', 'summing amplifier', 'difference amplifier', 'instrumentation amplifier', 'integrator', 'differentiator', 'cmrr', 'input offset', 'input bias', 'slew rate', 'gain-bandwidth', 'miller effect'] },
  { topic: 'Oscillators', keywords: ['oscillator', 'wien bridge', 'barkhausen', 'phase-shift', 'colpitts', 'hartley', 'crystal oscillator', 'relaxation oscillator', 'multivibrator', 'astable', 'monostable', 'bistable', '555 timer'] },
  { topic: 'PLL', keywords: ['pll', 'phase-locked', 'phase locked', 'vco', 'capture range', 'lock range', 'phase detector'] },
  { topic: 'Filters', keywords: ['filter', 'sallen-key', 'switched-capacitor', 'switched capacitor', 'active filter', 'passive filter', 'low-pass', 'high-pass', 'band-pass', 'band-stop', 'cutoff frequency'] },
  { topic: 'Timing', keywords: ['setup time', 'hold time', 'metastability', 'propagation delay', 'timing diagram', 'clock skew', 'clock gating', 'critical path', 'slack'] },
  { topic: 'VLSI / FPGA', keywords: ['vlsi', 'fpga', 'lut', 'pal', 'pla', 'asic', 'hdl', 'verilog', 'vhdl', 'synthesis', 'pnr', 'place and route', 'scan chain', 'jtag', 'boundary scan', 'fault', 'testability', 'stuck-at'] },
  { topic: 'Number Systems', keywords: ['binary', 'decimal', 'hexadecimal', 'octal', 'gray code', 'bcd', '2s complement', "two's complement", 'ones complement', "one's complement", 'signed', 'unsigned', 'radix', 'base conversion'] },
  { topic: 'Code Converters', keywords: ['code converter', 'binary to gray', 'gray to binary', 'bcd to excess', 'excess-3', 'parity', 'parity bit', 'parity generator', 'hamming code', 'error detection', 'error correction'] },
  { topic: 'Capacitors & Inductors', keywords: ['capacitor', 'capacitance', 'reactance', 'xc', 'inductor', 'inductance', 'xl', 'rl circuit', 'rc circuit', 'rlc', 'time constant'] },
  { topic: 'Thevenin / Norton', keywords: ['thevenin', 'norton', 'equivalent circuit', 'load current', 'open-circuit', 'short-circuit', 'source transformation'] },
  { topic: 'Power & Optimization', keywords: ['power', 'power consumption', 'power dissipation', 'static power', 'dynamic power', 'glitch', 'hazard', 'redundant', 'minimize', 'optimize', 'simplify'] },
  { topic: 'CPU Architecture', keywords: ['cpu', 'pipeline', 'instruction', 'opcode', 'operand', 'register', 'accumulator', 'program counter', 'control unit', 'datapath', 'harvard', 'von neumann', 'risc', 'cisc', 'microcode', 'interrupt', 'fetch', 'decode', 'execute'] },
  { topic: 'Waveforms & Clocks', keywords: ['waveform', 'clock', 'duty cycle', 'frequency', 'period', 'pulse', 'square wave', 'rising edge', 'falling edge', 'signal'] },
];

export function classifyTopic(question: string): string {
  const q = question.toLowerCase();
  for (const rule of TOPIC_RULES) {
    for (const kw of rule.keywords) {
      if (q.includes(kw)) return rule.topic;
    }
  }
  return 'General';
}

export function getTopicCounts(questions: { question: string; level: string }[]): Record<string, { basic: number; intermediate: number; advanced: number; total: number }> {
  const counts: Record<string, { basic: number; intermediate: number; advanced: number; total: number }> = {};
  for (const q of questions) {
    const topic = classifyTopic(q.question);
    if (!counts[topic]) counts[topic] = { basic: 0, intermediate: 0, advanced: 0, total: 0 };
    counts[topic].total++;
    if (q.level === 'basic') counts[topic].basic++;
    else if (q.level === 'intermediate') counts[topic].intermediate++;
    else if (q.level === 'advanced') counts[topic].advanced++;
  }
  return counts;
}

export const ALL_TOPICS = TOPIC_RULES.map(r => r.topic);
