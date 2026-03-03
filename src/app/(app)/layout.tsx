"use client";

import { usePathname } from "next/navigation";
import { CharacterProvider } from "@/providers/character/CharacterProvider";
import { AutoGovernanceProvider } from "@/providers/governance/AutoGovernanceProvider";
import { ChatProvider } from "@/providers/chat/ChatProvider";
import { ChatBubble } from "@/components/character/ChatBubble";
import { ChatWindow } from "@/components/character/ChatWindow";
import {
  Navigation,
  NavigationBrand,
  NavigationItems,
  NavigationItem,
  NavigationActions,
} from "@/components/ui/navigation";
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proposals", label: "Proposals" },
  { href: "/delegates", label: "Delegates" },
];

function AppNavigation() {
  const pathname = usePathname();

  return (
    <Navigation>
      <NavigationBrand>
        <span className="text-lg font-bold text-[var(--text-primary)]">
          Tokamak DAO
        </span>
      </NavigationBrand>

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
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CharacterProvider>
      <AutoGovernanceProvider>
        <ChatProvider>
          <div className="min-h-screen bg-[var(--bg-primary)]">
            <AppNavigation />
            <main className="container py-[var(--space-6)]">
              {children}
            </main>
            <ChatBubble />
            <ChatWindow />
          </div>
        </ChatProvider>
      </AutoGovernanceProvider>
    </CharacterProvider>
  );
}
