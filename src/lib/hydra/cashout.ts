/** A funds UTxO as returned by the backend's `GET /query-funds` (`fundsInL2`). */
export type FundsUtxo = {
  txHash: string;
  outputIndex: number;
  datum: string | null;
};

// ponytail: FundsDatum is Constr 0 [addr, locked_deposit, funds_type] in indefinite-length CBOR, and
// funds_type Merchant is Constr 1 [] (`d87a80`), so a merchant datum ends with `d87a80ff` (a User one
// ends with `ffff`). Decode the datum with CML if the backend ever changes the encoding.
export const isMerchantFunds = (u: FundsUtxo) =>
  u.datum?.endsWith("d87a80ff") ?? false;

/**
 * Body of `POST /withdraw` that cashes out all of a merchant's L2 funds UTxOs. The backend signs the
 * decommit with the admin key and pays each UTxO to its datum address (the merchant's own), so the
 * client signs nothing. Null when there is nothing to cash out.
 */
export function merchantCashoutBody(address: string, fundsInL2: FundsUtxo[]) {
  const funds = fundsInL2.filter(isMerchantFunds);
  if (funds.length === 0) return null;
  return {
    address,
    owner: "merchant",
    network_layer: "L2",
    funds_utxos: funds.map((u) => ({
      ref: { hash: u.txHash, index: u.outputIndex },
    })),
  };
}
