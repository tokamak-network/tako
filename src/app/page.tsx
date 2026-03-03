import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
          Tokamak DAO
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          Character-driven governance for the Tokamak Network.
          Vote, delegate, and shape the future of Layer2.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-[var(--radius-lg)] bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-bg-hover)] transition-colors shadow-sm hover:shadow-md"
          >
            Enter App
          </Link>
          <Link
            href="/proposals"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold rounded-[var(--radius-lg)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-fg)] border border-[var(--button-secondary-border)] hover:bg-[var(--button-secondary-bg-hover)] transition-colors"
          >
            View Proposals
          </Link>
        </div>
      </div>
    </div>
  );
}
