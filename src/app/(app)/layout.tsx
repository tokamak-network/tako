"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CharacterProvider } from "@/providers/character/CharacterProvider";
import { AutoGovernanceProvider } from "@/providers/governance/AutoGovernanceProvider";
import { AutoChatProvider } from "@/providers/chat/AutoChatProvider";
import { ChatBubble } from "@/components/character/ChatBubble";
import { ChatWindow } from "@/components/character/ChatWindow";
import {
  Navigation,
  NavigationBrand,
  NavigationItems,
  NavigationItem,
  NavigationActions,
} from "@/components/ui/navigation";
import { MobileNav, type NavItem } from "@/components/ui/mobile-nav";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proposals", label: "Proposals" },
  { href: "/delegates", label: "Delegates" },
  { href: "/faucet", label: "Faucet" },
  { href: "/forum", label: "Forum" },
  { href: "/security-council", label: "Security Council" },
];

const MOBILE_NAV_ITEMS: NavItem[] = NAV_ITEMS.map((item) => ({
  href: item.href,
  label: item.label,
}));

function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center size-10 rounded-[var(--radius-lg)] text-[var(--text-secondary)] hover:bg-[var(--interactive-secondary)] transition-colors lg:hidden"
      aria-label="Open menu"
    >
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

function AppNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Navigation>
        <div className="flex items-center gap-2">
          <HamburgerButton onClick={() => setMobileOpen(true)} />
          <NavigationBrand>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              Tokamak DAO
            </span>
          </NavigationBrand>
        </div>

        <NavigationItems>
          {NAV_ITEMS.map((item) => (
            <NavigationItem
              key={item.href}
              href={item.href}
              active={pathname.startsWith(item.href)}
            >
              {item.label}
            </NavigationItem>
          ))}
        </NavigationItems>

        <NavigationActions>
          <appkit-button />
        </NavigationActions>
      </Navigation>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={MOBILE_NAV_ITEMS}
        currentPath={pathname}
        logo={
          <span className="text-lg font-bold text-[var(--text-primary)]">
            Tokamak DAO
          </span>
        }
      />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CharacterProvider>
      <AutoGovernanceProvider>
        <AutoChatProvider>
          <div className="min-h-screen bg-[var(--bg-primary)]">
            <AppNavigation />
            <main className="container py-[var(--space-6)]">
              {children}
            </main>
            <ChatBubble />
            <ChatWindow />
          </div>
        </AutoChatProvider>
      </AutoGovernanceProvider>
    </CharacterProvider>
  );
}
