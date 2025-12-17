import * as CML from "@dcspark/cardano-multiplatform-lib-browser";
import { mnemonicToEntropy } from "bip39";
import * as TypeBox from "@sinclair/typebox";
import { Static } from "@sinclair/typebox";

export function getPrivateKey(
  seed: string,
  options: {
    password?: string;
    addressType?: "Base" | "Enterprise";
    accountIndex?: number;
    network?: any;
  } = { addressType: "Base", accountIndex: 0, network: "Mainnet" },
): CML.PrivateKey {
  function harden(num: number): number {
    if (typeof num !== "number") throw new Error("Type number required here!");
    return 0x80000000 + num;
  }

  const entropy = mnemonicToEntropy(seed);
  const rootKey = CML.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, "hex"),
    options.password
      ? new TextEncoder().encode(options.password)
      : new Uint8Array(),
  );

  const accountKey = rootKey
    .derive(harden(1852))
    .derive(harden(1815))

    .derive(harden(options.accountIndex!));

  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  return paymentKey;
}

var Constr = class {
  index;
  fields;
  constructor(index: any, fields: any) {
    this.index = index;
    this.fields = fields;
  }
};

export function to(
  data: any,
  type: any,
  options: { canonical?: boolean } = {},
) {
  const { canonical = false } = options;
  function serialize(data2: any) {
    try {
      if (typeof data2 === "bigint") {
        return CML.PlutusData.new_integer(
          CML.BigInteger.from_str(data2.toString()),
        );
      } else if (typeof data2 === "string") {
        return CML.PlutusData.new_bytes(Buffer.from(data2, "hex"));
      } else if (data2 instanceof Constr) {
        const { index, fields } = data2;
        const plutusList = CML.PlutusDataList.new();
        fields.forEach((field: any) => plutusList.add(serialize(field)));
        return CML.PlutusData.new_constr_plutus_data(
          CML.ConstrPlutusData.new(
            CML.BigInteger.from_str(index.toString()).as_u64() as bigint,
            plutusList,
          ),
        );
      } else if (data2 instanceof Array) {
        const plutusList = CML.PlutusDataList.new();
        data2.forEach((arg) => plutusList.add(serialize(arg)));
        return CML.PlutusData.new_list(plutusList);
      } else if (data2 instanceof Map) {
        const plutusMap = CML.PlutusMap.new();
        for (const [key, value] of data2.entries()) {
          plutusMap.set(serialize(key), serialize(value));
        }
        return CML.PlutusData.new_map(plutusMap);
      }
      throw new Error("Unsupported type");
    } catch (error) {
      throw new Error("Could not serialize the data: " + error);
    }
  }
  const d = type ? castTo(data, type) : data;
  return canonical
    ? serialize(d).to_canonical_cbor_hex()
    : serialize(d).to_cardano_node_format().to_cbor_hex();
}

function isVoid(shape: any) {
  return shape.index === 0 && shape.fields.length === 0;
}

function isNullable(shape: any) {
  return (
    shape.anyOf &&
    shape.anyOf[0]?.title === "Some" &&
    shape.anyOf[1]?.title === "None"
  );
}
function isBoolean(shape: any) {
  return (
    shape.anyOf &&
    shape.anyOf[0]?.title === "False" &&
    shape.anyOf[1]?.title === "True"
  );
}

function castTo(struct: any, type: any): any {
  const shape = type;
  if (!shape) throw new Error("Could not type cast struct.");
  const shapeType = (shape.anyOf ? "enum" : "") || shape.dataType;
  switch (shapeType) {
    case "integer": {
      if (typeof struct !== "bigint") {
        throw new Error("Could not type cast to integer.");
      }
      // integerConstraints(struct, shape);
      return struct;
    }
    case "bytes": {
      if (typeof struct !== "string") {
        throw new Error("Could not type cast to bytes.");
      }
      // bytesConstraints(struct, shape);
      return struct;
    }
    case "constructor": {
      if (isVoid(shape)) {
        if (struct !== void 0) {
          throw new Error("Could not type cast to void.");
        }
        return new Constr(0, []);
      } else if (
        typeof struct !== "object" ||
        struct === null ||
        shape.fields.length !== Object.keys(struct).length
      ) {
        throw new Error("Could not type cast to constructor.");
      }
      const fields = shape.fields.map((field: any) =>
        castTo(struct[field.title || "wrapper"], field),
      );
      return shape.hasConstr || shape.hasConstr === void 0
        ? new Constr(shape.index, fields)
        : fields;
    }
    case "enum": {
      if (shape.anyOf.length === 1) {
        return castTo(struct, shape.anyOf[0]);
      }
      if (isBoolean(shape)) {
        if (typeof struct !== "boolean") {
          throw new Error("Could not type cast to boolean.");
        }
        return new Constr(struct ? 1 : 0, []);
      } else if (isNullable(shape)) {
        if (struct === null) return new Constr(1, []);
        else {
          const fields = shape.anyOf[0].fields;
          if (fields.length !== 1) {
            throw new Error("Could not type cast to nullable object.");
          }
          return new Constr(0, [castTo(struct, fields[0])]);
        }
      }
      switch (typeof struct) {
        case "string": {
          if (!/[A-Z]/.test(struct[0] || "")) {
            throw new Error(
              "Could not type cast to enum. Enum needs to start with an uppercase letter.",
            );
          }
          const enumIndex = shape.anyOf.findIndex(
            (s: any) =>
              s.dataType === "constructor" &&
              s.fields.length === 0 &&
              s.title === struct,
          );
          if (enumIndex === -1) throw new Error("Could not type cast to enum.");
          return new Constr(enumIndex, []);
        }
        case "object": {
          if (struct === null) throw new Error("Could not type cast to enum.");
          const structTitle = Object.keys(struct)[0];
          if (!/[A-Z]/.test(structTitle || "")) {
            throw new Error(
              "Could not type cast to enum. Enum needs to start with an uppercase letter.",
            );
          }
          const enumEntry = shape.anyOf.find(
            (s: any) => s.dataType === "constructor" && s.title === structTitle,
          );
          if (!enumEntry) throw new Error("Could not type cast to enum.");
          const args = struct[structTitle || ""];
          return new Constr(
            enumEntry.index,
            // check if named args
            args instanceof Array
              ? args.map((item, index): any =>
                  castTo(item, enumEntry.fields[index]),
                )
              : enumEntry.fields.map((entry: any) => {
                  const [_, item] =
                    Object.entries(args).find(
                      ([title]) => title === entry.title,
                    ) || [];
                  return castTo(item, entry);
                }),
          );
        }
      }
      throw new Error("Could not type cast to enum.");
    }
    case "list": {
      if (!(struct instanceof Array)) {
        throw new Error("Could not type cast to array/tuple.");
      }
      if (shape.items instanceof Array) {
        const fields = struct.map((item, index): any =>
          castTo(item, shape.items[index]),
        );
        return shape.hasConstr ? new Constr(0, fields) : fields;
      } else {
        // listConstraints(struct, shape);
        return struct.map((item): any => castTo(item, shape.items));
      }
    }
    case "map": {
      if (!(struct instanceof Map)) {
        throw new Error("Could not type cast to map.");
      }
      // mapConstraints(struct, shape);
      const map = /* @__PURE__ */ new Map();
      for (const [key, value] of struct.entries()) {
        map.set(castTo(key, shape.keys), castTo(value, shape.values));
      }
      return map;
    }
    case void 0: {
      return struct;
    }
  }
  throw new Error("Could not type cast struct.");
}

function Map1(keys: any, values: any, options?: any) {
  const map = TypeBox.Type.Unsafe({
    dataType: "map",
    keys,
    values,
  });
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      map[key] = value;
    });
  }
  return map;
}

function Integer(options?: any) {
  const integer = TypeBox.Type.Unsafe({ dataType: "integer" });
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      integer[key] = value;
    });
  }
  return integer;
}

function Bytes(options?: any) {
  const bytes = TypeBox.Type.Unsafe({ dataType: "bytes" });
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      bytes[key] = value;
    });
  }
  return bytes;
}

export function assetsToDataPairs(assets: any): MapAssetsT {
  const policiesToAssets: Map<string, Map<string, bigint>> = new Map();
  for (const [unit, amount] of Object.entries(assets)) {
    const { policyId, assetName } = fromUnit(unit);
    const policy = policyId === "lovelace" ? "" : policyId;
    const policyAssets = policiesToAssets.get(policy);
    if (policyAssets) {
      policyAssets.set(assetName ?? "", amount as bigint);
    } else {
      const assetNamesToAmountMap: Map<string, bigint> = new Map();
      assetNamesToAmountMap.set(assetName ?? "", amount as bigint);
      policiesToAssets.set(policy, assetNamesToAmountMap);
    }
  }
  return policiesToAssets;
}

function fromUnit(unit: any) {
  const policyId = unit.slice(0, 56);
  const assetName = unit.slice(56) || null;
  // const label = fromLabel(unit.slice(56, 64));
  return { policyId, assetName };
}

export function valueTuplesToAssets(valueTuples: [string, bigint][]): any {
  return valueTuples.reduce((acc, [asset, value]) => {
    acc[asset] = (acc[asset] ?? 0n) + value;
    return acc;
  }, {} as any);
}

export const MapAssets = Map1(Bytes(), Map1(Bytes(), Integer()));

export type MapAssetsT = Map<string, Map<string, bigint>>;
