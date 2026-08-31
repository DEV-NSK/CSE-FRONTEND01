/**
 * CODEFLOW — API Service
 * Calls POST /api/codeflow/execute
 */

import axiosInstance from '@/shared/lib/axios';
import type { ExecutionResult } from '../types/codeflow.types';
import type { ApiResponse } from '@/types';

export const codeflowService = {
  execute: (code: string, language = 'javascript') =>
    axiosInstance.post<ApiResponse<ExecutionResult>>('/codeflow/execute', { code, language }),

  getLanguages: () =>
    axiosInstance.get<ApiResponse<{ languages: Array<{ id: string; name: string; description: string }> }>>('/codeflow/languages'),
};
