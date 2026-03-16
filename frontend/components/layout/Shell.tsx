'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Gavel, PieChart, BarChart3, FlaskConical,
  Settings, ChevronDown, Calendar, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { ChatAgent } from '@/components/ui/ChatAgent';

// ─────────────────────────────────────────
// NAV STRUCTURE
// ─────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: 'Campaigns',
    items: [
      { href: '/auction',    label: 'Live auction',     icon: Gavel,       sub: 'Bid recommendations' },
      { href: '/budget',     label: 'Budget optimizer', icon: PieChart,    sub: 'Allocation & pacing' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/strategy',   label: 'Strategy dashboard', icon: BarChart3,   sub: 'Rules & competitor intel' },
      { href: '/simulation', label: 'Marketplace sim',    icon: FlaskConical,sub: 'Monte Carlo scenarios' },
    ],
  },
];

const PAGE_META: Record<string, { title: string; subtitle: string; section: string }> = {
  '/auction':    { section: 'Campaigns',    title: 'Live Auction',        subtitle: 'Real-time bid recommendations' },
  '/budget':     { section: 'Campaigns',    title: 'Budget Optimizer',    subtitle: 'Allocation & pacing analysis' },
  '/strategy':   { section: 'Intelligence', title: 'Strategy Dashboard',  subtitle: 'Slot rankings & competitor intelligence' },
  '/simulation': { section: 'Intelligence', title: 'Marketplace Sim',     subtitle: 'Monte Carlo auction scenarios' },
};

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      className="flex flex-col flex-shrink-0 h-full bg-surface border-r border-bdr-strong"
      style={{ width: 'var(--sidebar-width)' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center px-4 border-b border-bdr" style={{ height: 'var(--topbar-height)' }}>
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-b500 flex items-center justify-center flex-shrink-0">
              <Zap size={13} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-15 font-bold text-b500 tracking-tight">AdBid</span>
          </div>
          <p className="text-11 text-ts mt-0.5 pl-[30px]">Intelligence</p>
        </div>
      </div>

      {/* Account selector */}
      <div className="mx-3 my-2.5">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-hov border border-bdr text-13 font-medium text-tp hover:border-bdr-strong transition-colors"
          aria-label="Select account"
          aria-haspopup="true"
        >
          <span className="truncate">Acme Corp — Q1 2025</span>
          <ChevronDown size={13} strokeWidth={1.5} className="text-tt ml-2 flex-shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pb-2" aria-label="Platform navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="section-label px-4 pt-4 pb-1.5">{section.label}</p>
            <div className="px-2 space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'relative flex items-center gap-2.5 px-3 py-2 rounded-lg mx-0 transition-colors',
                      active
                        ? 'bg-b100 nav-active-indicator'
                        : 'hover:bg-hov group',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className={clsx(
                        'flex-shrink-0',
                        active ? 'text-b500' : 'text-ts group-hover:text-tp',
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={clsx(
                        'text-13 font-medium leading-tight',
                        active ? 'text-b700' : 'text-ts group-hover:text-tp',
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-bdr p-3">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div
            className="w-7 h-7 rounded-full bg-b100 flex items-center justify-center flex-shrink-0 text-12 font-semibold text-b700"
            aria-hidden="true"
          >
            MK
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-13 font-medium text-tp leading-tight truncate">Maya Kim</p>
            <p className="text-11 text-tt leading-tight truncate">Media Buyer</p>
          </div>
          <button
            className="p-1 rounded text-tt hover:text-ts hover:bg-hov transition-colors"
            aria-label="Settings"
          >
            <Settings size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────

function Topbar({ pathname }: { pathname: string }) {
  const meta = Object.entries(PAGE_META).find(([k]) => pathname.startsWith(k))?.[1];

  return (
    <header
      className="flex items-center justify-between px-6 bg-surface border-b border-bdr flex-shrink-0"
      style={{ height: 'var(--topbar-height)' }}
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-13">
          <li>
            <span className="text-ts">Acme Corp</span>
          </li>
          {meta && (
            <>
              <li className="text-tt">/</li>
              <li>
                <span className="text-ts">{meta.section}</span>
              </li>
              <li className="text-tt">/</li>
              <li>
                <span className="text-tp font-medium">{meta.title}</span>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Date range picker */}
        <button
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-bdr bg-surface text-13 text-ts hover:border-bdr-strong hover:text-tp transition-colors"
          aria-label="Select date range"
        >
          <Calendar size={13} strokeWidth={1.5} className="text-tt" aria-hidden="true" />
          Last 7 days
          <ChevronDown size={12} strokeWidth={1.5} className="text-tt" aria-hidden="true" />
        </button>

        {/* System status pills */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-g100 text-g700 text-11 font-medium">
            <span className="status-dot-active" aria-hidden="true" />
            Agent live
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-b100 text-b700 text-11 font-medium">
            claude-sonnet-4-6
          </span>
        </div>

        {/* Settings */}
        <button
          className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
          aria-label="Platform settings"
        >
          <Settings size={15} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────
// SHELL
// ─────────────────────────────────────────

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full bg-page">
      <Sidebar pathname={pathname} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar pathname={pathname} />
        <main
          className="flex-1 overflow-y-auto p-6 bg-page page-content"
          id="main-content"
          aria-label="Page content"
        >
          {children}
        </main>
      </div>
      {/* Global AI chat agent — accessible on every page */}
      <ChatAgent />
    </div>
  );
}
