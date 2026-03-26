import { useReducer, useCallback } from 'react';
import { isStepComplete } from '../utils/validators.js';

function resolveVisibleSteps(steps, responses) {
  return steps.filter((step) => {
    if (step.type !== 'conditional') return true;
    const { dependsOn, matchValue } = step.config;
    const answer = responses[dependsOn];
    if (Array.isArray(answer)) return answer.includes(matchValue);
    return answer === matchValue;
  });
}

const initialState = {
  currentIndex: 0,
  responses: {},
  direction: 'forward', // 'forward' | 'backward'
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESPONSE':
      return {
        ...state,
        responses: { ...state.responses, [action.field]: action.value },
      };

    case 'NEXT':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        direction: 'forward',
      };

    case 'BACK':
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
        direction: 'backward',
      };

    case 'GO_TO':
      return {
        ...state,
        currentIndex: action.index,
        direction: action.index > state.currentIndex ? 'forward' : 'backward',
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export default function useFormSession(steps = []) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const visibleSteps = resolveVisibleSteps(steps, state.responses);
  const currentStep = visibleSteps[state.currentIndex];
  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === visibleSteps.length - 1;
  const canProceed = currentStep ? isStepComplete(currentStep, state.responses) : false;

  const setResponse = useCallback((field, value) => {
    dispatch({ type: 'SET_RESPONSE', field, value });
  }, []);

  const next = useCallback(() => {
    if (!isLast) dispatch({ type: 'NEXT' });
  }, [isLast]);

  const back = useCallback(() => {
    if (!isFirst) dispatch({ type: 'BACK' });
  }, [isFirst]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    currentIndex: state.currentIndex,
    currentStep,
    responses: state.responses,
    direction: state.direction,
    visibleSteps,
    totalSteps: visibleSteps.length,
    isFirst,
    isLast,
    canProceed,
    setResponse,
    next,
    back,
    reset,
  };
}
