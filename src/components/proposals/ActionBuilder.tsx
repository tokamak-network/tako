"use client";

import { useState } from "react";
import { encodeFunctionData, isAddress } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export interface BuiltAction {
  target: string;
  value: string;
  calldata: string;
  isValid: boolean;
  label?: string;
}

interface AbiFunction {
  name: string;
  type: "function";
  inputs: { name: string; type: string }[];
  stateMutability: string;
}

const COMMON_TARGETS: { label: string; address: string; abi: AbiFunction[] }[] = [
  {
    label: "Custom (enter address)",
    address: "",
    abi: [],
  },
];

export function ActionBuilder({
  index,
  onUpdate,
  onRemove,
}: {
  index: number;
  onUpdate: (action: BuiltAction) => void;
  onRemove: () => void;
}) {
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("0");
  const [selectedTarget, setSelectedTarget] = useState(0);
  const [customAbi, setCustomAbi] = useState("");
  const [selectedFn, setSelectedFn] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [calldata, setCalldata] = useState("");

  const currentTarget = COMMON_TARGETS[selectedTarget];
  const abiFunctions: AbiFunction[] = (() => {
    if (currentTarget?.abi.length) return currentTarget.abi;
    if (!customAbi) return [];
    try {
      const parsed = JSON.parse(customAbi);
      return (Array.isArray(parsed) ? parsed : [parsed]).filter(
        (e: { type: string }) => e.type === "function"
      );
    } catch {
      return [];
    }
  })();

  const selectedFunction = abiFunctions.find((f) => f.name === selectedFn);

  const handleEncode = () => {
    if (!selectedFunction) return;
    try {
      const args = selectedFunction.inputs.map((input) => {
        const val = params[input.name] || "";
        if (input.type.startsWith("uint") || input.type.startsWith("int")) return BigInt(val);
        if (input.type === "bool") return val === "true";
        if (input.type.endsWith("[]")) return JSON.parse(val);
        return val;
      });

      const encoded = encodeFunctionData({
        abi: [selectedFunction],
        functionName: selectedFunction.name,
        args,
      });

      setCalldata(encoded);
      const addr = currentTarget?.address || target;
      onUpdate({
        target: addr,
        value,
        calldata: encoded,
        isValid: isAddress(addr) && !!encoded,
        label: `${selectedFunction.name}(${selectedFunction.inputs.map((i) => params[i.name] || "").join(", ")})`,
      });
    } catch (err) {
      console.error("Encoding error:", err);
    }
  };

  return (
    <Card className="border-l-2 border-l-[var(--color-primary-500)]">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Action {index + 1}</h4>
          <Button variant="ghost" size="sm" onClick={onRemove}>Remove</Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Target Contract</label>
            <Select
              value={selectedTarget}
              onChange={(e) => {
                setSelectedTarget(Number(e.target.value));
                setSelectedFn("");
                setParams({});
              }}
            >
              {COMMON_TARGETS.map((t, i) => (
                <option key={i} value={i}>{t.label}</option>
              ))}
            </Select>
          </div>

          {!currentTarget?.address && (
            <>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Target Address</label>
                <Input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0x..."
                  error={target.length > 0 && !isAddress(target)}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">ABI (JSON)</label>
                <Input
                  value={customAbi}
                  onChange={(e) => setCustomAbi(e.target.value)}
                  placeholder='[{"name":"foo","type":"function",...}]'
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">ETH Value (wei)</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
          </div>

          {abiFunctions.length > 0 && (
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Function</label>
              <Select
                value={selectedFn}
                onChange={(e) => {
                  setSelectedFn(e.target.value);
                  setParams({});
                }}
                placeholder="Select function"
              >
                {abiFunctions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}({f.inputs.map((i) => i.type).join(", ")})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {selectedFunction?.inputs.map((input) => (
            <div key={input.name}>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                {input.name} ({input.type})
              </label>
              <Input
                value={params[input.name] || ""}
                onChange={(e) => setParams({ ...params, [input.name]: e.target.value })}
                placeholder={input.type}
              />
            </div>
          ))}

          {selectedFunction && (
            <Button size="sm" variant="secondary" onClick={handleEncode}>
              Encode Calldata
            </Button>
          )}

          {calldata && (
            <div className="bg-[var(--bg-tertiary)] p-2 rounded text-xs font-mono text-[var(--text-secondary)] break-all">
              {calldata}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionBuilderList({
  actions,
  onActionsChange,
}: {
  actions: BuiltAction[];
  onActionsChange: (actions: BuiltAction[]) => void;
}) {
  const handleAdd = () => {
    onActionsChange([...actions, { target: "", value: "0", calldata: "", isValid: false }]);
  };

  const handleUpdate = (index: number, action: BuiltAction) => {
    const newActions = [...actions];
    newActions[index] = action;
    onActionsChange(newActions);
  };

  const handleRemove = (index: number) => {
    onActionsChange(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {actions.map((_, i) => (
        <ActionBuilder
          key={i}
          index={i}
          onUpdate={(a) => handleUpdate(i, a)}
          onRemove={() => handleRemove(i)}
        />
      ))}
      <Button variant="secondary" onClick={handleAdd}>+ Add Action</Button>
    </div>
  );
}
