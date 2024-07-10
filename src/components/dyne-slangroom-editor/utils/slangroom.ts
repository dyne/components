// -- Loading -- //

export async function loadSlangroom() {
  try {
    await import('@slangroom/browser/build/slangroom.js');
  } catch (error) {
    console.error('Failed to load slangroom:', error);
  }
}

function slangroom() {
  const s = window['slangroom'];
  if (!s) throw new Error('Slangroom not loaded!');
  return s;
}

// -- Running -- //

export async function executeSlangroomContract(props: ExecuteContractProps): Promise<SlangroomResult> {
  const { contract, data = {}, keys = {} } = props;
  try {
    console.log('Executing contract:', contract, 'with window.slangroom:', slangroom());
    const result = await slangroom().execute(contract, {
      data,
      keys,
    });
    return {
      success: true,
      value: result.result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export type SlangroomResult = { success: true; value: Record<string, unknown> } | { success: false; error: string };

type ExecuteContractProps = {
  contract: string;
  data?: Record<string, unknown>;
  keys?: Record<string, unknown>;
};

// -- Error Handling -- //

// type ZenroomError = {
//   logs: Array<string>
//   trace: Array<string>
//   heap: Record<string,unknown>
// }

// type BaseError = {
//   message: string
// }

function parseErrorString(errorMessage: string) {
  try {
    const parsed = JSON.parse(errorMessage);
    if (isArrayError(parsed)) return parsed;
    else throw new Error('Unknown error format');
  } catch (e) {
    console.log(e);
  }
  return errorMessage;
}

function isArrayError(data: unknown): data is Array<string> {
  return Array.isArray(data) && data.every(i => typeof i == 'string');
}

function processArrayError(arrayError: string[]): ParsedArrayError {
  const HEAP_TOKEN = 'J64 HEAP:';
  const TRACE_TOKEN = 'J64 TRACE:';

  function findBase64(token: string) {
    return (
      arrayError
        .find(s => s.startsWith(token))
        ?.split(token)
        .at(-1)
        ?.trim() ?? ''
    );
  }

  const heap = parseHeap(atob(findBase64(HEAP_TOKEN)));
  const trace = parseTrace(atob(findBase64(TRACE_TOKEN)));

  const logs = arrayError.filter(s => !s.startsWith(HEAP_TOKEN) && !s.startsWith(TRACE_TOKEN)).join('\n');

  return {
    logs,
    heap,
    trace,
  };
}

function parseTrace(traceString: string) {
  const parsedTrace = JSON.parse(traceString) as Array<string>;
  return parsedTrace.join('\n');
}

function parseHeap(heapString: string) {
  const parsedHeap = JSON.parse(heapString) as Record<string, unknown>;
  return JSON.stringify(parsedHeap, null, 2);
}

type ParsedArrayError = {
  logs: string;
  heap: string;
  trace: string;
};

export function parseSlangroomError(errorMessage: string) {
  const parsed = parseErrorString(errorMessage);
  if (Array.isArray(parsed)) return processArrayError(parsed);
  else return parsed;
}
