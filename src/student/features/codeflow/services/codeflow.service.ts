/**
 * CODEFLOW — API Service
 * Calls POST /api/codeflow/execute
 */

import axiosInstance from '@/shared/lib/axios';
import type { ExecutionResult } from '../types/codeflow.types';
import type { ApiResponse } from '@/types';
import type { CodeflowLanguage } from '../store/codeflowStore';

export const codeflowService = {
  execute: (code: string, language: CodeflowLanguage = 'javascript') =>
    axiosInstance.post<ApiResponse<ExecutionResult>>('/codeflow/execute', { code, language }),

  getLanguages: () =>
    axiosInstance.get<ApiResponse<{ languages: Array<{ id: string; name: string; description: string }> }>>('/codeflow/languages'),

  getExamples: (language: CodeflowLanguage) =>
    axiosInstance.get<ApiResponse<Array<{ label: string; code: string }>>>(`/codeflow/examples/${language}`),
};
