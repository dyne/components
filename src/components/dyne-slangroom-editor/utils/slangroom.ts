import { Type as T, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

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

export async function executeSlangroomContract(
  props: ExecuteContractProps,
): Promise<SlangroomResult> {
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
      error: parseSlangroomError(error.message as string),
    };
  }
}

export type SlangroomResult =
  | { success: true; value: SlangroomValue }
  | { success: false; error: SlangroomError };

export type SlangroomValue = Record<string, unknown>;

type ExecuteContractProps = {
  contract: string;
  data?: Record<string, unknown>;
  keys?: Record<string, unknown>;
};

// -- Error Handling -- //

export type SlangroomError = ZencodeRuntimeError | BaseError;

export type ZencodeRuntimeError = {
  logs: Logs;
  trace: Trace;
  heap: Heap;
};

type BaseError = string;

export function parseSlangroomError(errorMessage: string): SlangroomError {
  if (isZenroomLog(errorMessage)) {
    return processZencodeLogs(parseLogs(errorMessage));
  } else {
    return errorMessage;
  }
}

function processZencodeLogs(zencodeLogs: string[]): ZencodeRuntimeError {
  const HEAP_TOKEN = 'J64 HEAP:';
  const TRACE_TOKEN = 'J64 TRACE:';

  function findBase64(token: string) {
    return (
      zencodeLogs
        .find(s => s.startsWith(token))
        ?.split(token)
        .at(-1)
        ?.trim() ?? ''
    );
  }

  function removeHeapAndTraceFromLogs(logs: Logs) {
    return logs.filter(s => !s.startsWith(HEAP_TOKEN) && !s.startsWith(TRACE_TOKEN));
  }

  const logs = removeHeapAndTraceFromLogs(zencodeLogs);
  const heap = parseHeap(findBase64(HEAP_TOKEN));
  const trace = parseTrace(findBase64(TRACE_TOKEN));

  return {
    logs,
    heap,
    trace,
  };
}

function isZenroomLog(errorMessage: string) {
  try {
    const isStringArray = Value.Check(LogsSchema, JSON.parse(errorMessage));
    const hasZenroomString = errorMessage.includes('ZENROOM JSON LOG START');
    return isStringArray && hasZenroomString;
  } catch {
    return false;
  }
}

const LogsSchema = T.Array(T.String());
type Logs = Static<typeof LogsSchema>;

function parseLogs(logsString: string) {
  return Value.Decode(LogsSchema, JSON.parse(logsString));
}

const HeapSchema = T.Record(T.String(), T.Unknown());
type Heap = Static<typeof HeapSchema>;

function parseHeap(heapB64String: string) {
  return Value.Decode(HeapSchema, JSON.parse(atob(heapB64String)));
}

const TraceSchema = T.Array(T.String());
type Trace = Static<typeof TraceSchema>;

function parseTrace(traceB64String: string) {
  return Value.Decode(TraceSchema, JSON.parse(atob(traceB64String)));
}
