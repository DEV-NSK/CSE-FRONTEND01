// ─── FPRD-16: Topic icon + color mapping ────────────────────────────────────

export interface TopicMeta {
  icon: string       // emoji
  color: string      // tailwind bg class for the card accent
  textColor: string  // tailwind text class
}

const topicMeta: Record<string, TopicMeta> = {
  'arrays':              { icon: '📊', color: 'bg-blue-500/10',   textColor: 'text-blue-600 dark:text-blue-400' },
  'strings':             { icon: '🔤', color: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' },
  'linked-list':         { icon: '🔗', color: 'bg-cyan-500/10',   textColor: 'text-cyan-600 dark:text-cyan-400' },
  'stack':               { icon: '📚', color: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
  'queue':               { icon: '🚶', color: 'bg-teal-500/10',   textColor: 'text-teal-600 dark:text-teal-400' },
  'trees':               { icon: '🌳', color: 'bg-green-500/10',  textColor: 'text-green-600 dark:text-green-400' },
  'binary-search-tree':  { icon: '🌲', color: 'bg-emerald-500/10',textColor: 'text-emerald-600 dark:text-emerald-400' },
  'binary-tree':         { icon: '🌿', color: 'bg-lime-500/10',   textColor: 'text-lime-600 dark:text-lime-400' },
  'graph':               { icon: '🕸️', color: 'bg-indigo-500/10', textColor: 'text-indigo-600 dark:text-indigo-400' },
  'dynamic-programming': { icon: '⚡', color: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400' },
  'greedy':              { icon: '🪙', color: 'bg-amber-500/10',  textColor: 'text-amber-600 dark:text-amber-400' },
  'recursion':           { icon: '🔄', color: 'bg-violet-500/10', textColor: 'text-violet-600 dark:text-violet-400' },
  'hashing':             { icon: '#️⃣', color: 'bg-rose-500/10',   textColor: 'text-rose-600 dark:text-rose-400' },
  'heap':                { icon: '⛰️', color: 'bg-stone-500/10',  textColor: 'text-stone-600 dark:text-stone-400' },
  'sliding-window':      { icon: '🪟', color: 'bg-sky-500/10',    textColor: 'text-sky-600 dark:text-sky-400' },
  'two-pointer':         { icon: '👉', color: 'bg-blue-500/10',   textColor: 'text-blue-600 dark:text-blue-400' },
  'prefix-sum':          { icon: '➕', color: 'bg-pink-500/10',   textColor: 'text-pink-600 dark:text-pink-400' },
  'bit-manipulation':    { icon: '🔢', color: 'bg-gray-500/10',   textColor: 'text-gray-600 dark:text-gray-400' },
  'backtracking':        { icon: '↩️', color: 'bg-red-500/10',    textColor: 'text-red-600 dark:text-red-400' },
  'trie':                { icon: '🔎', color: 'bg-fuchsia-500/10',textColor: 'text-fuchsia-600 dark:text-fuchsia-400' },
  'matrix':              { icon: '🔲', color: 'bg-slate-500/10',  textColor: 'text-slate-600 dark:text-slate-400' },
  'sorting':             { icon: '🔀', color: 'bg-cyan-500/10',   textColor: 'text-cyan-600 dark:text-cyan-400' },
  'searching':           { icon: '🔍', color: 'bg-blue-500/10',   textColor: 'text-blue-600 dark:text-blue-400' },
  'math':                { icon: '🔢', color: 'bg-teal-500/10',   textColor: 'text-teal-600 dark:text-teal-400' },
  'number-theory':       { icon: '∞',  color: 'bg-indigo-500/10', textColor: 'text-indigo-600 dark:text-indigo-400' },
  'geometry':            { icon: '📐', color: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
  'simulation':          { icon: '🎮', color: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' },
  'binary-search':       { icon: '🎯', color: 'bg-green-500/10',  textColor: 'text-green-600 dark:text-green-400' },
  'divide-and-conquer':  { icon: '⚔️', color: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400' },
  'segment-tree':        { icon: '🌵', color: 'bg-emerald-500/10',textColor: 'text-emerald-600 dark:text-emerald-400' },
  'fenwick-tree':        { icon: '🌴', color: 'bg-lime-500/10',   textColor: 'text-lime-600 dark:text-lime-400' },
}

const defaultMeta: TopicMeta = {
  icon: '💡',
  color: 'bg-primary/10',
  textColor: 'text-primary',
}

export function getTopicMeta(slug: string): TopicMeta {
  return topicMeta[slug] ?? defaultMeta
}
