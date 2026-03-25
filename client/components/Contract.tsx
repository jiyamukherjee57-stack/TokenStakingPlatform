"use client";

import { useState, useCallback } from "react";
import {
  stake,
  withdraw,
  getStake,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "stake" | "withdraw" | "view";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

interface StakeInfo {
  amount: bigint;
  timestamp: bigint;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("stake");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [isViewing, setIsViewing] = useState(false);
  const [stakeData, setStakeData] = useState<StakeInfo | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleStake = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!stakeAmount.trim()) return setError("Enter an amount to stake");
    const amount = BigInt(stakeAmount);
    if (amount <= BigInt(0)) return setError("Amount must be positive");
    setError(null);
    setIsStaking(true);
    setTxStatus("Awaiting signature...");
    try {
      await stake(walletAddress, amount);
      setTxStatus("Tokens staked successfully!");
      setStakeAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsStaking(false);
    }
  }, [walletAddress, stakeAmount]);

  const handleWithdraw = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsWithdrawing(true);
    setTxStatus("Awaiting signature...");
    try {
      await withdraw(walletAddress);
      setTxStatus("Tokens withdrawn successfully!");
      setStakeData(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsWithdrawing(false);
    }
  }, [walletAddress]);

  const handleViewStake = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsViewing(true);
    setStakeData(null);
    try {
      const result = await getStake(walletAddress);
      if (result && typeof result === "object" && "amount" in result) {
        setStakeData(result as unknown as StakeInfo);
      } else {
        setError("No stake found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [walletAddress]);

  const formatAmount = (amount: bigint | undefined) => {
    if (amount === undefined || amount === null) return "0";
    return amount.toString();
  };

  const formatTimestamp = (ts: bigint | undefined) => {
    if (ts === undefined || ts === null) return "-";
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleString();
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "stake", label: "Stake", icon: <ArrowUpIcon />, color: "#34d399" },
    { key: "withdraw", label: "Withdraw", icon: <ArrowDownIcon />, color: "#fbbf24" },
    { key: "view", label: "View Stake", icon: <WalletIcon />, color: "#4fc3f7" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("successfully") || txStatus.includes("updated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <CoinsIcon className="text-[#34d399]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Token Staking Platform</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Stake */}
            {activeTab === "stake" && (
              <div className="space-y-5">
                <MethodSignature name="stake" params="(user: Address, amount: i128)" returns="-> void" color="#34d399" />
                <Input 
                  label="Amount (stroops)" 
                  value={stakeAmount} 
                  onChange={(e) => setStakeAmount(e.target.value)} 
                  placeholder="e.g. 1000000" 
                  type="number"
                />
                <p className="text-xs text-white/25">Enter the amount in stroops (1 XLM = 10,000,000 stroops)</p>
                {walletAddress ? (
                  <ShimmerButton onClick={handleStake} disabled={isStaking} shimmerColor="#34d399" className="w-full">
                    {isStaking ? <><SpinnerIcon /> Staking...</> : <><ArrowUpIcon /> Stake Tokens</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to stake
                  </button>
                )}
              </div>
            )}

            {/* Withdraw */}
            {activeTab === "withdraw" && (
              <div className="space-y-5">
                <MethodSignature name="withdraw" params="(user: Address)" returns="-> i128" color="#fbbf24" />
                <p className="text-sm text-white/50">Withdraw your staked tokens from the contract.</p>
                {walletAddress ? (
                  <ShimmerButton onClick={handleWithdraw} disabled={isWithdrawing} shimmerColor="#fbbf24" className="w-full">
                    {isWithdrawing ? <><SpinnerIcon /> Withdrawing...</> : <><ArrowDownIcon /> Withdraw All</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf21]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to withdraw
                  </button>
                )}
              </div>
            )}

            {/* View Stake */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_stake" params="(user: Address)" returns="-> Option<StakeInfo>" color="#4fc3f7" />
                <p className="text-sm text-white/50">View your current stake information.</p>
                {walletAddress ? (
                  <>
                    <ShimmerButton onClick={handleViewStake} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                      {isViewing ? <><SpinnerIcon /> Fetching...</> : <><WalletIcon /> View My Stake</>}
                    </ShimmerButton>

                    {stakeData && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                        <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Your Stake</span>
                          <Badge variant="success">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                            Active
                          </Badge>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/35 flex items-center gap-1.5">
                              <CoinsIcon /> Amount
                            </span>
                            <span className="font-mono text-sm text-white/80">{formatAmount(stakeData.amount)} stroops</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/35 flex items-center gap-1.5">
                              <ClockIcon /> Staked At
                            </span>
                            <span className="font-mono text-sm text-white/80">{formatTimestamp(stakeData.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#4fc3f7]/20 bg-[#4fc3f7]/[0.03] py-4 text-sm text-[#4fc3f7]/60 hover:border-[#4fc3f7]/30 hover:text-[#4fc3f7]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to view stake
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Token Staking Platform &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#34d399]" />
                <span className="font-mono text-[9px] text-white/15">Stake</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#fbbf24]" />
                <span className="font-mono text-[9px] text-white/15">Earn</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Withdraw</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
