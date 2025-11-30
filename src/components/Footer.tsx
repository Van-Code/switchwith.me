import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-auto py-8 bg-gradient-to-b from-transparent to-amber-100/60

    ">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">Switch With Me</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find other fans to swap seats with so everyone gets the view they want.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About the Creator
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/listings"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/listings/new"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Listing
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li> */}
              <li>
                <Link
                  href="/about#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-6 mb-4">
          This is a fan-made project and isn’t affiliated with Bay FC, the Golden State Valkyries, the NWSL, the WNBA, Ticketmaster, or any stadium or venue where these teams play.
        </div>
        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Switch With Me. Built with care for the
          community.
        </div>
      </div>
    </footer>
  );
}
