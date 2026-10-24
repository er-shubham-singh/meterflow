'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, Activity } from 'lucide-react';

/**
 * CircularMetricCard Component
 * Reusable enterprise card with a high-fidelity SVG circular progress ring,
 * designed to match the Figma aesthetics of the MonthlyLimitCard.
 */
export default function CircularMetricCard({
  title = 'Metric Title',
  subtitle = '',
  badgeText = '',
  badgeVariant = 'blue', // 'blue' | 'purple' | 'emerald' | 'amber' | 'rose'
  percentage = 0,
  percentageLabel = 'Utilized',
  metric = '',
  subtext = '',
  strokeColor = '#0284C7',
  trackColor = '#F1F5F9',
  textColor = '',
  cardBg = 'bg-white',
  borderColor = 'border-slate-200/80',
  className = '',
  icon: Icon
}) {
  const size = 116;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2; // 53px
  const circumference = 2 * Math.PI * radius; // ~333px

  // Physical progress ratio capped at 100% for stroke display
  const progressRatio = Math.min(100, Math.max(0, percentage)) / 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const getBadgeClasses = (variant) => {
    switch (variant) {
      case 'emerald':
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'rose':
      case 'red':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const activeTextColor = textColor || strokeColor;

  return (
    <div
      className={`rounded-2xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden border ${cardBg} ${borderColor} ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] font-medium text-slate-400 truncate">
              {subtitle}
            </div>
          )}
        </div>

        {badgeText && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${getBadgeClasses(
              badgeVariant
            )}`}
          >
            {Icon ? <Icon size={12} /> : <CheckCircle2 size={12} />}
            <span>{badgeText}</span>
          </span>
        )}
      </div>

      {/* Center: Circular Progress Ring */}
      <div className="flex flex-col items-center justify-center my-2 relative z-10">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Dynamic Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage & Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span
              className="text-2xl font-black font-mono leading-none"
              style={{ color: activeTextColor }}
            >
              {percentage}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-400">
              {percentageLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Main Metric & Subtext */}
      <div className="mt-2 text-center relative z-10">
        <div className="text-base font-bold font-mono tracking-tight text-slate-900 truncate">
          {metric}
        </div>

        {subtext && (
          <div className="mt-1 text-[11px] text-slate-500 font-medium truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
