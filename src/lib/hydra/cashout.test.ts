import { describe, it, expect } from "vitest";
import { merchantCashoutBody } from "./cashout";

// Live preprod datums (query-funds, 2026-10-10): merchant M's funds UTxO and one of payer P's.
const M =
  "addr_test1qqkmdp58hy4urz4zyszpdawfr23fhc3aky27rd7wh0u95h2pvaaxc8qdc6kmpuhz4t5kchxcneya5qtwfes0549pyujqveuc6j";
const MERCHANT_DATUM =
  "d8799fd8799fd8799f581c2db68687b92bc18aa2240416f5c91aa29be23db115e1b7cebbf85a5dffd8799fd8799fd8799f581c41677a6c1c0dc6adb0f2e2aae96c5cd89e49da016e4e60fa54a12724ffffffff00d87a80ff";
const USER_DATUM =
  "d8799fd8799fd8799f581c1947cfe51869472cbf60610bc39c2a4dbf8216e350746da4407ed26affd8799fd8799fd8799f581cc85ecc50d509b7e8aa3de83db06879ba3c5c72cf3e6d11647ea4fbe4ffffffff1a002ff206d8799f58200000000000000000000000000000000000000000000000000000000000000000ffff";
const MERCHANT_TX = "71c5bfedb55bb9706bab01af26e24502504c681527ded1b5a2575ba4a058a9e5";

describe("merchantCashoutBody", () => {
  it("withdraws the merchant funds UTxOs from L2 as owner 'merchant', without signatures", () => {
    const body = merchantCashoutBody(M, [
      { txHash: MERCHANT_TX, outputIndex: 0, datum: MERCHANT_DATUM },
      { txHash: "a".repeat(64), outputIndex: 1, datum: USER_DATUM },
      { txHash: "b".repeat(64), outputIndex: 0, datum: null },
    ]);
    expect(body).toEqual({
      address: M,
      owner: "merchant",
      network_layer: "L2",
      funds_utxos: [{ ref: { hash: MERCHANT_TX, index: 0 } }],
    });
  });

  it("returns null when there are no merchant funds in L2", () => {
    expect(merchantCashoutBody(M, [])).toBeNull();
    expect(
      merchantCashoutBody(M, [
        { txHash: "a".repeat(64), outputIndex: 1, datum: USER_DATUM },
      ]),
    ).toBeNull();
  });
});
