/**
 * CODEFLOW — Variable Panel
 * Shows all scopes and their variables with live value highlighting.
 * PRD §7 (Global Execution Context), §10 (Variable Visualization)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scope, Variable } from '../types/codeflow.types';
import { formatValue, valueColorClass } from '../utils/codeflow.utils';

interface Props {
  scopes: Scope[];
  currentStepIndex: number;
  isDark?: boolean;
}

export const VariablePanel: React.FC<Props> = ({ scopes, currentStepIndex, isDark = true }) => {
  const visibleScopes = scopes.filter((s) => s.variables.length > 0 || s.type === 'global');
  const emptyText = isDark ? 'text-zinc-500' : 'text-slate-400';

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {visibleScopes.map((scope) => (
        <ScopeBlock key={scope.id} scope={scope} currentStepIndex={currentStepIndex} isDark={isDark} />
      ))}
      {visibleScopes.every((s) => s.variables.length === 0) && (
        <p className={`text-xs text-center mt-4 ${emptyText}`}>No variables yet.</p>
      )}
    </div>
  );
};

const ScopeBlock: React.FC<{ scope: Scope; currentStepIndex: number; isDark: boolean }> = ({ scope, currentStepIndex, isDark }) => {
  const scopeLabel =
    scope.type === 'global' ? 'Global Execution Context' :
    scope.type === 'function' ? `Function: ${scope.name}` :
    `Block Scope`;

  const borderColor =
    scope.type === 'global' ? 'border-blue-500/40' :
    scope.type === 'function' ? 'border-purple-500/40' :
    'border-teal-500/40';

  const labelColor =
    scope.type === 'global' ? 'text-blue-400' :
    scope.type === 'function' ? 'text-purple-400' :
    'text-teal-400';

  const blockBg = isDark ? 'bg-zinc-900/60' : 'bg-white';
  const headerBg = isDark ? 'bg-zinc-900' : 'bg-slate-50';
  const emptyText = isDark ? 'text-zinc-600' : 'text-slate-400';

  return (
    <div className={`rounded-lg border ${borderColor} ${blockBg} overflow-hidden`}>
      <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${labelColor} ${headerBg}`}>
        {scopeLabel}
      </div>
      <div className="px-2 py-1">
        <AnimatePresence mode="popLayout">
          {scope.variables.length === 0 ? (
            <p className={`text-xs px-1 py-1 ${emptyText}`}>empty</p>
          ) : (
            scope.variables.map((v) => (
              <VariableRow key={v.name} variable={v} currentStepIndex={currentStepIndex} isDark={isDark} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const VariableRow: React.FC<{ variable: Variable; currentStepIndex: number; isDark: boolean }> = ({ variable, currentStepIndex, isDark }) => {
  const justChanged = variable.changedAtStep === currentStepIndex;
  const isTdz = variable.state === 'tdz';

  const kindText = isDark ? 'text-zinc-500' : 'text-slate-400';
  const nameText = isDark ? 'text-zinc-200' : 'text-slate-800';
  const undefinedText = isDark ? 'text-zinc-500' : 'text-slate-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: justChanged ? 'rgba(234, 179, 8, 0.12)' : 'transparent',
      }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between rounded px-2 py-1 text-xs group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-[9px] font-mono font-semibold uppercase shrink-0 ${kindText}`}>
          {variable.kind}
        </span>
        <span className={`font-mono truncate ${nameText}`}>{variable.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {justChanged && (
          <span className="text-yellow-400 text-[9px] font-bold">●</span>
        )}
        {isTdz ? (
          <span className="text-orange-400 font-mono text-[10px] bg-orange-900/30 px-1.5 py-0.5 rounded">
            TDZ
          </span>
        ) : variable.state === 'hoisted_undefined' ? (
          <span className={`font-mono text-[10px] ${undefinedText}`}>undefined</span>
        ) : (
          <span className={`font-mono text-[11px] max-w-[120px] truncate ${valueColorClass(variable.value)}`}>
            {formatValue(variable.value)}
          </span>
        )}
      </div>
    </motion.div>
  );
};
