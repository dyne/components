export async function loadSlangroom() {
  try {
    await import('@slangroom/browser/build/slangroom.js');
  } catch (error) {
    console.error('Failed to load slangroom:', error);
  }
}

function slangroom() {
  return window['slangroom'];
}

//

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

//
