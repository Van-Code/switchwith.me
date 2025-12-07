// react-emails/emails/MatchNotification.tsx
import * as React from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";

export default function MatchNotification({
  userName = "there",
  eventName = "Valkyries vs Opponents",
  eventDate = "July 12, 2025",
  yourSeats = "Section 118, Row 7, Seat 4",
  theirSeats = "Section 104, Row 10, Seat 8",
  url = "https://switchwith.me",
}: {
  userName?: string;
  eventName?: string;
  eventDate?: string;
  yourSeats?: string;
  theirSeats?: string;
  url?: string;
}) {
  return (
    <Layout>
      <tr>
        <td style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151" }}>
          <p style={{ margin: "0 0 12px 0" }}>Hi {userName},</p>

          <p style={{ margin: "0 0 16px 0" }}>
            Someone wants to swap seats with you. Here’s the info:
          </p>
        </td>
      </tr>

      <tr>
        <td
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "14px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px 0",
              fontSize: "12px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#6b7280",
            }}
          >
            Swap Summary
          </p>

          <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#111827" }}>
            <strong>Event:</strong> {eventName}
          </p>

          <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#111827" }}>
            <strong>Date:</strong> {eventDate}
          </p>

          <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#111827" }}>
            <strong>Your seats:</strong> {yourSeats}
          </p>

          <p style={{ margin: 0, fontSize: "14px", color: "#111827" }}>
            <strong>Their seats:</strong> {theirSeats}
          </p>
        </td>
      </tr>

      <tr>
        <td style={{ paddingTop: "16px", paddingBottom: "20px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#4b5563" }}>
            If this looks good to you, open your conversation to coordinate the
            details. Keeping swaps inside the platform helps keep everyone safe.
          </p>

          <Button href={url}>View Swap</Button>
        </td>
      </tr>
    </Layout>
  );
}
