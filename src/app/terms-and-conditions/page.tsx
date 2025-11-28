import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms, Safety & Common Sense - Valkyries Seat Swap',
  description: 'Terms of service and safety guidelines for Valkyries Seat Swap',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Terms, Safety & Common Sense</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome! This site is a fan-made way to help people find each other to swap or share tickets.
          By using the site, you&apos;re agreeing to the stuff below. If you don&apos;t agree, please don&apos;t use it.
        </p>
      </div>

      {/* Important Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-8">
        <p className="text-amber-900 dark:text-amber-200 font-semibold text-center">
          ⚠️ This platform connects fans only. We don&apos;t verify tickets, handle money, or guarantee swaps.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>What this site actually does (and doesn&apos;t do)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2 text-green-700 dark:text-green-400">✓ This site:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Lets people post and browse ticket listings</li>
                <li>Lets people message each other about possible swaps or sales</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-red-700 dark:text-red-400">✗ This site does NOT:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Verify that any ticket is real, valid, or transferable</li>
                <li>Handle money, hold funds, or act as escrow</li>
                <li>Act as an agent, broker, or official partner of any team, venue, or ticketing platform (including Ticketmaster, etc.)</li>
              </ul>
            </div>
            <p className="bg-muted p-3 rounded-md">
              All tickets, payments, and meetups are <strong>between you and the other person</strong>,
              not between you and this site.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>Use at your own risk</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You use this site <strong>at your own risk</strong>.</p>
            <p className="font-semibold">That means:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You&apos;re responsible for who you talk to</li>
              <li>You&apos;re responsible for any tickets you buy, sell, or swap</li>
              <li>You&apos;re responsible for verifying that your tickets are legit (for example, by confirming with the official ticketing provider or app)</li>
            </ul>
            <p className="bg-muted p-3 rounded-md">
              The site is provided <strong>&quot;as is,&quot; with no guarantees</strong> about accuracy,
              availability, uptime, or user behavior.
            </p>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>No guarantee of ticket legitimacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">We don&apos;t:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Confirm who owns a ticket</li>
                <li>Confirm that a ticket will scan at the gate</li>
                <li>Guarantee that a transfer will work in any particular app or platform</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-md">
              <p className="font-semibold mb-2 text-blue-900 dark:text-blue-200">💡 You should always:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-blue-900 dark:text-blue-200">
                <li>Double-check tickets in the original ticketing app</li>
                <li>Be cautious about sending money to strangers</li>
                <li>Walk away if something feels off</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>Payments and swaps are between users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Any money you send or receive, and any ticket you transfer or accept, is purely between
              you and the other user.
            </p>
            <div>
              <p className="font-semibold mb-2">This site:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Doesn&apos;t process payments</li>
                <li>Doesn&apos;t hold funds</li>
                <li>Doesn&apos;t step into disputes about who owes what</li>
              </ul>
            </div>
            <p className="bg-muted p-3 rounded-md">
              If something goes wrong with a transaction, <strong>you</strong> are responsible for dealing
              with the other person and/or your bank, payment app, or ticket provider.
            </p>
          </CardContent>
        </Card>

        {/* Section 5 - Safety Tips */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-start gap-2 text-green-900 dark:text-green-200">
              <span className="text-primary">5.</span>
              <span>🛡️ Safety tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold">Please use common sense:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Prefer meeting in public or using trusted digital transfers</li>
              <li>If you&apos;re doing in-person transfers, meet in safe, public places</li>
              <li>Screenshot or save proof of transfers and agreements</li>
              <li>If someone pressures you, rushes you, or refuses reasonable verification, you can always say <strong>no</strong></li>
            </ul>
            <p className="bg-background p-3 rounded-md border">
              If you think someone is scamming or harassing people, you can report it and we may review
              or remove their listings or account.
            </p>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">6.</span>
              <span>Your responsibilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold">By using the site, you agree that you will:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Only list tickets you actually have the right to transfer or sell</li>
              <li>Not post misleading, fraudulent, or deceptive listings</li>
              <li>Not harass, threaten, or abuse other users</li>
              <li>Follow the rules of the original ticketing platform and the venue</li>
            </ul>
            <p className="bg-muted p-3 rounded-md">
              We can remove listings or limit access if we believe someone is causing harm or gaming the system.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">7.</span>
              <span>Limitation of liability</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold">To the fullest extent allowed by law:</p>
            <div className="bg-muted p-4 rounded-md">
              <p className="mb-2">
                The site and its creator(s) are <strong>not liable</strong> for any losses, scams, damages, or problems that happen because of:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tickets you bought, sold, swapped, or tried to swap</li>
                <li>Messages or interactions with other users</li>
                <li>Canceled games, changes in schedule, or venue issues</li>
              </ul>
            </div>
            <p>
              If you use the site and something goes wrong, you agree that you won&apos;t hold the site
              or its creator(s) responsible for money lost, missed events, or any other damages.
            </p>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">8.</span>
              <span>Not for kids</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>This site is intended for adults. If you&apos;re under 18, please don&apos;t use it.</p>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="text-primary">9.</span>
              <span>Changes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              These terms may change as the site evolves. If they do, we&apos;ll update this page.
              Continuing to use the site means you accept the updated terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-center">
              If you have questions or concerns about safety or something sketchy happening on the site,
              you can reach out at: <strong className="text-primary">[your contact email here]</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
