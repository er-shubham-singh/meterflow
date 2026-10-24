'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight } from 'lucide-react';

/**
 * MonthlyLimitCard Component (FIGMA SPEC #01 & TICKET-01)
 * Dynamic progress ring calculation and state transition based on quota utilization percentage:
 * utilizationPercentage = (currentUsage / monthlyLimit) * 100
 * 
 * - Normal State (<100%):
 *   Primary Ring Stroke Color: #0284C7 (Primary Blue)
 *   Status Badge: Default neutral blue fill
 * 
 * - Exceeded State (≥100%):
 *   Progress Ring Stroke switches to #DC2626 (Alert Red)
 *   Card background tint switches to #FEE2E2 (Light Red Fill)
 *   Status pill reads: Limit Exceeded
 *   Main metric: 18,220 / 10,000 Requests (16px Bold) with warning sub-text
 */
export default function MonthlyLimitCard({
  currentUsage = 18220,
  monthlyLimit = 10000,
  unit = 'Requests',
  title = 'Monthly Limit',
  subtitle = 'Quota & Gateway Threshold',
  className = ''
}) {
  // Dynamically calculate utilization percentage
  const utilizationPercentage = monthlyLimit > 0 
    ? Math.round((currentUsage / monthlyLimit) * 100) 
    : 0;

  // Dynamic state transition
  const [cardState, setCardState] = useState(
    utilizationPercentage >= 100 ? 'overBudget' : 'normal'
  );

  useEffect(() => {
    if (utilizationPercentage >= 100) {
      setCardState('overBudget');
    } else {
      setCardState('normal');
    }
  }, [utilizationPercentage]);

  const isOverBudget = cardState === 'overBudget';

  // SVG circular ring geometry
  const size = 116;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2; // 53px
  const circumference = 2 * Math.PI * radius; // ~333px
  // Stroke fills up to 100% physically, even when over-budget
  const progressRatio = Math.min(100, Math.max(0, utilizationPercentage)) / 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Over-budget amount
  const overAmount = Math.max(0, currentUsage - monthlyLimit);

  return (
    <div
      className={`rounded-2xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden ${
        isOverBudget
          ? 'bg-[#FEE2E2] border border-[#FCA5A5] text-slate-900 shadow-rose-100'
          : 'bg-white border border-slate-200/80 text-slate-800'
      } ${className}`}
      data-testid="monthly-limit-card"
      data-state={cardState}
    >
      {/* Background radial glow when over-budget */}
      {isOverBudget && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div>
          <div className={`text-xs font-bold uppercase tracking-wider ${
            isOverBudget ? 'text-red-800' : 'text-slate-500'
          }`}>
            {title}
          </div>
          {subtitle && (
            <div className={`text-[11px] font-medium ${
              isOverBudget ? 'text-red-700/80' : 'text-slate-400'
            }`}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Dynamic Status Badge */}
        {isOverBudget ? (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/80 text-[#DC2626] border border-[#DC2626]/40 shadow-xs animate-pulse"
            title="Usage exceeds assigned quota threshold"
          >
            <ShieldAlert size={12} className="text-[#DC2626]" />
            <span>Limit Exceeded</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 size={12} className="text-sky-600" />
            <span>Normal</span>
          </span>
        )}
      </div>

      {/* Center: Dynamic Circular Progress Ring */}
      <div className="flex flex-col items-center justify-center my-2 relative z-10">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isOverBudget ? '#FECDD3' : '#F1F5F9'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isOverBudget ? '#DC2626' : '#0284C7'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span
              className={`text-2xl font-black font-mono leading-none ${
                isOverBudget ? 'text-[#DC2626]' : 'text-[#0284C7]'
              }`}
            >
              {utilizationPercentage}%
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                isOverBudget ? 'text-red-700' : 'text-slate-400'
              }`}
            >
              Utilized
            </span>
          </div>
        </div>
      </div>

      {/* Main Metric & Warning Subtext Specification */}
      <div className="mt-2 text-center relative z-10">
        <div
          className={`text-base font-bold font-mono tracking-tight ${
            isOverBudget ? 'text-red-950' : 'text-slate-900'
          }`}
        >
          <span>{currentUsage.toLocaleString()}</span>
          <span className="text-slate-400 font-normal"> / </span>
          <span>{monthlyLimit.toLocaleString()}</span>
          <span className="text-xs font-semibold ml-1.5 opacity-90">{unit}</span>
        </div>

        {/* Warning or Status Subtext */}
        {isOverBudget ? (
          <div className="mt-2 p-2 rounded-xl bg-white/70 border border-red-300/60 text-[11px] font-medium text-red-800 flex items-center justify-center gap-1.5">
            <AlertTriangle size={13} className="text-[#DC2626] shrink-0" />
            <span>
              Quota exceeded by <strong className="font-bold">{overAmount.toLocaleString()}</strong> requests.
            </span>
          </div>
        ) : (
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            {(monthlyLimit - currentUsage).toLocaleString()} {unit.toLowerCase()} available before limit
          </div>
        )}
      </div>
    </div>
  );
}
