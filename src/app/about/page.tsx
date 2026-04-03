import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import ContactForm from "@/components/contact-form"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Card className="bg-muted/30 border-purple-300/20" id="contact">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Get in Touch</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Have feedback, questions, or ideas for collaboration? Want to discuss
            sponsorship opportunities or just say hi? I'd love to hear from you!
          </p>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  )
}
