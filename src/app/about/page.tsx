import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import Image from "next/image"
import { Heart } from "lucide-react"


export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          About the Creator
        </h1>
        <p className="text-muted-foreground text-lg">
          A little story about how this whole thing happened
        </p>
      </div>

      {/* Sketch / Portrait */}
      <div className="flex justify-center">
        <div className="rounded-full overflow-hidden border shadow-md w-40 h-40">
          <Image
            src="/sketch.jpeg"
            alt="Cartoon sketch of Van"
            width={160}
            height={160}
            className="object-cover"
          />
        </div>
      </div>

      {/* Card Section */}
      <Card className="bg-muted/30 border-purple-300/20">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Hi, I'm Van</h2>
        </CardHeader>

        <CardContent className="space-y-4 text-lg leading-relaxed">
            <p className="text-lg leading-relaxed text-muted-foreground">
                Hey there! I'm Van — the person behind this little corner of the internet.
                I built this project after hearing friends talk about how chaotic swapping
                Valkyries tickets could be. I'm not a superfan in the “paint my face gold” way,
                but I <em>do</em> love watching the games and being surrounded by the incredible
                energy of queer fans. Honestly, the community is what pulled me in.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                Outside of coding things like this, I spend a lot of time with my dogs
                (they're definitely my emotional support gremlins), trying out new recipes,
                and planning my next trip even if I have zero business traveling anywhere.
                I like simple joys: the SF breeze, beautiful hikes, and those rare days when
                I actually remember to stretch.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                I also do volunteer tech work for nonprofits and community spaces. It's my
                small way of helping projects I care about thrive. If you've ever been part of
                grassroots anything, you know how much heart goes into keeping things running.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                This ticket swap started as a tiny idea and turned into something I really
                enjoyed building. If it ends up being useful to you or makes your game day
                a little better, that means a lot.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                Thanks for being here. And if you ever see me at a game — feel free to say hi.
            </p>
        </CardContent>
      
      </Card>
      <div  className="space-y-6">
        <form
            action="https://www.paypal.com/donate"
            method="post"
            target="_top"
            className="flex justify-center"
            >
            <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL" />
            <input type="hidden" name="no_recurring" value="0" />
            <input
                type="hidden"
                name="item_name"
                value="Support Golden State Valkyries Ticket Swap"
            />
            <input type="hidden" name="currency_code" value="USD" />
            <Button
                type="submit"
                size="lg"
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
                <Heart className="mr-2 h-5 w-5" />
                Donate via PayPal
            </Button>
        </form>
        <div className="text-center">
            <Button
            variant="outline"
            size="sm"
            className="text-amber-700 border-amber-300 hover:bg-amber-50 "
            asChild
            >
            <a href="mailto:youremail@example.com">Sponsor or Partner</a>
            </Button>
        </div>
        </div>
    </div>
  )
}
