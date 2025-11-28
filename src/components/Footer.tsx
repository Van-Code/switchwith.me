import  Link  from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-16 py-8 bg-gradient-to-b from-transparent to-purple-950/20">
      <div className="container mx-auto px-4">

        {/* Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <p className="text-sm text-muted-foreground">
              A community-driven platform for Golden State Valkyries fans 
              to swap seats easily and safely — especially those wanting to 
              sit near queer and sapphic friends in the arena.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Mission</h4>
            <p className="text-sm text-muted-foreground">
              Keep seat-swapping free, accessible, and community-focused. 
              No hidden fees — just fans helping fans connect.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Get Involved</h4>
            <p className="text-sm text-muted-foreground">
              Want to support this project or become a sponsor?  
              <a href="mailto:youremail@example.com" className="underline hover:text-purple-400">
                Reach out anytime
              </a>.  
              Community-aligned partners are always welcome.
            </p>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-muted-foreground mb-4">
          This is an independent fan project and is not affiliated with or endorsed by the Golden State Valkyries,
          the WNBA, or Ticketmaster. <Link href="/terms-and-conditions" className="hover:text-foreground underline">
              Terms & Safety
            </Link>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Golden State Valkyries Ticket Swap. Built with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  )
}
