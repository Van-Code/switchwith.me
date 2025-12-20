"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, User, CheckCircle2, Clock } from "lucide-react"
import {
  getMatchTransactionType,
  formatSeatLabel,
  formatRequestLabel,
  getScoreLabel,
  getCtaText,
  getHeaderText,
  getSubtext,
  getHelperText,
  isNewMember,
  type MatchTransactionType,
} from "@/lib/matchUtils"

export interface MatchCardListing {
  id: string
  listingType?: "HAVE" | "WANT"
  haveSection: string
  haveRow: string
  haveSeat: string
  haveZone: string
  wantZones?: string[]
  wantSections?: string[]
  user?: {
    id: string
    createdAt?: Date | string
    profile: {
      firstName: string
      lastInitial: string | null
      successfulSwapsCount?: number
      emailVerified?: boolean
      phoneVerified?: boolean
    }
  }
}

export interface MatchCardProps {
  myListing: MatchCardListing
  matchedListing: MatchCardListing
  score: number
  reason: string
  onMessageClick: () => void
  isLoading?: boolean
}

export function MatchCard({
  myListing,
  matchedListing,
  score,
  reason,
  onMessageClick,
  isLoading = false,
}: MatchCardProps) {
  const transactionType = getMatchTransactionType({
    viewerListing: myListing,
    otherListing: matchedListing,
  })

  const scoreLabel = getScoreLabel(score)
  const headerText = getHeaderText(transactionType)
  const subtext = getSubtext(transactionType, myListing, matchedListing)
  const ctaText = getCtaText(transactionType)
  const helperText = getHelperText(transactionType)

  const ownerName = matchedListing.user
    ? `${matchedListing.user.profile.firstName} ${matchedListing.user.profile.lastInitial || ""}.`
    : "Owner"

  const swapsCount = matchedListing.user?.profile?.successfulSwapsCount || 0
  const isVerified = matchedListing.user?.profile?.emailVerified || matchedListing.user?.profile?.phoneVerified
  const memberIsNew = matchedListing.user?.createdAt ? isNewMember(matchedListing.user.createdAt) : false

  if (transactionType === "SWAP") {
    return <SwapLayout {...{
      myListing,
      matchedListing,
      score,
      scoreLabel,
      headerText,
      subtext,
      ctaText,
      helperText,
      ownerName,
      swapsCount,
      isVerified,
      memberIsNew,
      onMessageClick,
      isLoading,
    }} />
  }

  return <VerticalLayout {...{
    myListing,
    matchedListing,
    score,
    scoreLabel,
    headerText,
    subtext,
    ctaText,
    helperText,
    ownerName,
    swapsCount,
    isVerified,
    memberIsNew,
    transactionType,
    onMessageClick,
    isLoading,
  }} />
}

interface LayoutProps {
  myListing: MatchCardListing
  matchedListing: MatchCardListing
  score: number
  scoreLabel: string
  headerText: string
  subtext: string
  ctaText: string
  helperText: string
  ownerName: string
  swapsCount: number
  isVerified: boolean | undefined
  memberIsNew: boolean
  transactionType?: MatchTransactionType
  onMessageClick: () => void
  isLoading: boolean
}

function SwapLayout({
  myListing,
  matchedListing,
  score,
  scoreLabel,
  headerText,
  subtext,
  ctaText,
  helperText,
  ownerName,
  swapsCount,
  isVerified,
  memberIsNew,
  onMessageClick,
  isLoading,
}: LayoutProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-900 mb-1 flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-cyan-600" />
              {headerText}
            </CardTitle>
            <p className="text-sm text-slate-600">{subtext}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{scoreLabel}</div>
            <div className="text-xs text-slate-500" title="Based on zone and section compatibility">
              Match score: {score}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Your Offer */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Offer</div>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="text-sm font-medium text-slate-900">{formatSeatLabel(myListing)}</div>
              <div className="text-xs text-slate-600">{myListing.haveZone}</div>
              <div className="text-xs text-slate-500 mt-2">
                <span className="font-medium">Wants:</span> {formatRequestLabel(myListing)}
              </div>
            </div>
          </div>

          {/* Their Offer */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Their Offer</div>
            <div className="bg-cyan-50 rounded-lg p-3 space-y-1">
              <div className="text-sm font-medium text-slate-900">{formatSeatLabel(matchedListing)}</div>
              <div className="text-xs text-slate-600">{matchedListing.haveZone}</div>
              <div className="text-xs text-slate-500 mt-2">
                <span className="font-medium">Wants:</span> {formatRequestLabel(matchedListing)}
              </div>
              <TrustSignals
                ownerName={ownerName}
                swapsCount={swapsCount}
                isVerified={isVerified}
                memberIsNew={memberIsNew}
              />
            </div>
          </div>
        </div>

        <HelperBlock text={helperText} />

        <Button
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={onMessageClick}
          disabled={isLoading}
        >
          {isLoading ? "Opening..." : ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}

function VerticalLayout({
  myListing,
  matchedListing,
  score,
  scoreLabel,
  headerText,
  subtext,
  ctaText,
  helperText,
  ownerName,
  swapsCount,
  isVerified,
  memberIsNew,
  transactionType,
  onMessageClick,
  isLoading,
}: LayoutProps) {
  const isSell = transactionType === "SELL"

  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-900 mb-1">{headerText}</CardTitle>
            <p className="text-sm text-slate-600">{subtext}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{scoreLabel}</div>
            <div className="text-xs text-slate-500" title="Based on zone and section compatibility">
              Match score: {score}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show in order: your seat, their request for SELL; their seat, your request for BUY */}
        {isSell ? (
          <>
            <ListingBlock
              title="Your Seat"
              listing={myListing}
              highlight
              showWants={false}
            />
            <ListingBlock
              title="Their Request"
              listing={matchedListing}
              ownerName={ownerName}
              swapsCount={swapsCount}
              isVerified={isVerified}
              memberIsNew={memberIsNew}
              showWants={true}
            />
          </>
        ) : (
          <>
            <ListingBlock
              title="Their Seat"
              listing={matchedListing}
              ownerName={ownerName}
              swapsCount={swapsCount}
              isVerified={isVerified}
              memberIsNew={memberIsNew}
              highlight
              showWants={false}
            />
            <ListingBlock
              title="Your Request"
              listing={myListing}
              showWants={true}
            />
          </>
        )}

        <HelperBlock text={helperText} />

        <Button
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={onMessageClick}
          disabled={isLoading}
        >
          {isLoading ? "Opening..." : ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}

interface ListingBlockProps {
  title: string
  listing: MatchCardListing
  ownerName?: string
  swapsCount?: number
  isVerified?: boolean
  memberIsNew?: boolean
  highlight?: boolean
  showWants?: boolean
}

function ListingBlock({
  title,
  listing,
  ownerName,
  swapsCount,
  isVerified,
  memberIsNew,
  highlight = false,
  showWants = false,
}: ListingBlockProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
      <div className={`rounded-lg p-3 space-y-1 ${highlight ? "bg-cyan-50" : "bg-slate-50"}`}>
        <div className="text-sm font-medium text-slate-900">{formatSeatLabel(listing)}</div>
        {listing.haveZone && <div className="text-xs text-slate-600">{listing.haveZone}</div>}
        {showWants && (
          <div className="text-xs text-slate-500 mt-2">
            <span className="font-medium">Looking for:</span> {formatRequestLabel(listing)}
          </div>
        )}
        {ownerName && (
          <TrustSignals
            ownerName={ownerName}
            swapsCount={swapsCount || 0}
            isVerified={isVerified}
            memberIsNew={memberIsNew || false}
          />
        )}
      </div>
    </div>
  )
}

interface TrustSignalsProps {
  ownerName: string
  swapsCount: number
  isVerified?: boolean
  memberIsNew: boolean
}

function TrustSignals({ ownerName, swapsCount, isVerified, memberIsNew }: TrustSignalsProps) {
  return (
    <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
      <div className="flex items-center gap-2 text-xs text-slate-700">
        <User className="h-3 w-3" />
        <span className="font-medium">{ownerName}</span>
        {isVerified && (
          <span title="Verified">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          </span>
        )}
      </div>
      {swapsCount > 0 && (
        <div className="text-xs text-slate-500">
          {swapsCount} successful swap{swapsCount !== 1 ? "s" : ""}
        </div>
      )}
      {memberIsNew && swapsCount === 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          <span>New member</span>
        </div>
      )}
    </div>
  )
}

interface HelperBlockProps {
  text: string
}

function HelperBlock({ text }: HelperBlockProps) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
      <p className="text-xs text-amber-900 leading-relaxed">{text}</p>
    </div>
  )
}
