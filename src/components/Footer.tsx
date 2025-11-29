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
              Have ideas or want to help the project grow? I&apos;d love to hear from you.
            </p>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-muted-foreground mb-4">
        This is a fan-created project and is not affiliated with Golden State Valkyries,
          the WNBA, Ticketmaster, or Chase Center. <Link href="/terms-and-conditions" className="hover:text-foreground underline">
              Terms & Safety
            </Link>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Switch With Me. Built with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  )
}
