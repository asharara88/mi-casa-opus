import { useState, useCallback, useEffect } from "react";

export type WorkflowType = "sales" | "leasing" | "co_broker";

export interface WorkflowState {
  workflowType: WorkflowType;
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  generatedDocIds: Record<string, string>; // prompt_id -> document_id
  startedAt: string;
  lastUpdatedAt: string;
}

const STORAGE_KEY = "micasa_workflow_state";

// Get all active workflows from localStorage
export function getActiveWorkflows(): Record<string, WorkflowState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Get a specific workflow by type
export function getWorkflowState(workflowType: WorkflowType): WorkflowState | null {
  const workflows = getActiveWorkflows();
  return workflows[workflowType] || null;
}

// Save workflow state
function saveWorkflowState(workflowType: WorkflowType, state: WorkflowState) {
  const workflows = getActiveWorkflows();
  workflows[workflowType] = {
    ...state,
    lastUpdatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

// Clear workflow state
function clearWorkflowState(workflowType: WorkflowType) {
  const workflows = getActiveWorkflows();
  delete workflows[workflowType];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function useWorkflowState(workflowType: WorkflowType | null) {
  const [state, setState] = useState<WorkflowState | null>(null);

  // Load state from localStorage on mount or type change
  useEffect(() => {
    if (!workflowType) {
      setState(null);
      return;
    }
    const existing = getWorkflowState(workflowType);
    setState(existing);
  }, [workflowType]);

  // Initialize a new workflow
  const startWorkflow = useCallback((type: WorkflowType): WorkflowState => {
    // Check for existing workflow first
    const existing = getWorkflowState(type);
    if (existing) {
      setState(existing);
      return existing;
    }

    const newState: WorkflowState = {
      workflowType: type,
      currentStepIndex: 0,
      completedSteps: [],
      skippedSteps: [],
      generatedDocIds: {},
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
    saveWorkflowState(type, newState);
    setState(newState);
    return newState;
  }, []);

  // Mark step as completed
  const completeStep = useCallback((promptId: string, documentId?: string) => {
    if (!workflowType || !state) return;

    const newState: WorkflowState = {
      ...state,
      completedSteps: state.completedSteps.includes(promptId) 
        ? state.completedSteps 
        : [...state.completedSteps, promptId],
      generatedDocIds: documentId 
        ? { ...state.generatedDocIds, [promptId]: documentId }
        : state.generatedDocIds
    };
    saveWorkflowState(workflowType, newState);
    setState(newState);
  }, [workflowType, state]);

  // Skip a step
  const skipStep = useCallback((promptId: string) => {
    if (!workflowType || !state) return;

    const newState: WorkflowState = {
      ...state,
      skippedSteps: state.skippedSteps.includes(promptId)
        ? state.skippedSteps
        : [...state.skippedSteps, promptId]
    };
    saveWorkflowState(workflowType, newState);
    setState(newState);
  }, [workflowType, state]);

  // Move to a specific step
  const goToStep = useCallback((index: number) => {
    if (!workflowType || !state) return;

    const newState: WorkflowState = {
      ...state,
      currentStepIndex: index
    };
    saveWorkflowState(workflowType, newState);
    setState(newState);
  }, [workflowType, state]);

  // Advance to next step
  const advanceStep = useCallback((totalSteps: number) => {
    if (!workflowType || !state) return;

    const nextIndex = Math.min(state.currentStepIndex + 1, totalSteps - 1);
    const newState: WorkflowState = {
      ...state,
      currentStepIndex: nextIndex
    };
    saveWorkflowState(workflowType, newState);
    setState(newState);
  }, [workflowType, state]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    if (!workflowType) return;
    clearWorkflowState(workflowType);
    setState(null);
  }, [workflowType]);

  // End workflow (clear completely)
  const endWorkflow = useCallback(() => {
    if (!workflowType) return;
    clearWorkflowState(workflowType);
    setState(null);
  }, [workflowType]);

  // Check if a step is completed
  const isStepCompleted = useCallback((promptId: string): boolean => {
    return state?.completedSteps.includes(promptId) ?? false;
  }, [state]);

  // Check if a step is skipped
  const isStepSkipped = useCallback((promptId: string): boolean => {
    return state?.skippedSteps.includes(promptId) ?? false;
  }, [state]);

  // Get document ID for a completed step
  const getDocumentId = useCallback((promptId: string): string | undefined => {
    return state?.generatedDocIds[promptId];
  }, [state]);

  return {
    state,
    startWorkflow,
    completeStep,
    skipStep,
    goToStep,
    advanceStep,
    resetWorkflow,
    endWorkflow,
    isStepCompleted,
    isStepSkipped,
    getDocumentId
  };
}
