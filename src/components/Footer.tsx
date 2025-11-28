import { Heart } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function Footer() {
  return (
    <footer className="border-t mt-16 py-8 bg-gradient-to-b from-transparent to-purple-950/20">
      <div className="container mx-auto px-4">
        {/* Support Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <h3 className="text-xl font-semibold">Support This Project</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Built by an individual who saw a need for a better ticket swap service.
                  Help bring the community together and keep this site free for everyone.
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-purple-400">Looking for sponsors!</span> If you'd like to support this community platform, please reach out.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <form action="https://www.paypal.com/donate" method="post" target="_top">
                  <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL" />
                  <input type="hidden" name="no_recurring" value="0" />
                  <input type="hidden" name="item_name" value="Support Golden State Valkyries Ticket Swap" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Donate via PayPal
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">Every contribution helps keep the site running</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <p className="text-sm text-muted-foreground">
              A community-driven platform for Golden State Valkyries fans to swap tickets easily and safely.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Mission</h4>
            <p className="text-sm text-muted-foreground">
              Keep ticket swapping free, accessible, and community-focused. No hidden fees, just fans helping fans.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Get Involved</h4>
            <p className="text-sm text-muted-foreground">
              Interested in sponsoring or partnering? We'd love to hear from you to help grow this community resource.
            </p>
          </div>
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
