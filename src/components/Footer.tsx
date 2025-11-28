import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-sm text-muted-foreground text-center max-w-4xl mx-auto">
          <p className="mb-2">
            <strong>Friendly legal note:</strong> This site just helps fans find each other.
            We don&apos;t verify tickets, handle money, or guarantee swaps. Please double-check
            everything and use your judgment.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/terms-and-conditions" className="hover:text-foreground underline">
              Terms & Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
