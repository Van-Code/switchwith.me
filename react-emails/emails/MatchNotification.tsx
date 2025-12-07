// react-emails/emails/MatchNotification.tsx
import * as React from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";

export default function MatchNotification({
  userName = "there",
  url = "https://switchwith.me/matches",
  description = "",
}: {
  userName?: string;
  url?: string;
  description?: string,
}) {
  return (
    <Layout>
      <tr>
        <td style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151" }}>
          <p style={{ margin: "0 0 12px 0" }}>
            Hi {userName},</p>

          <p style={{ margin: "0 0 12px 0" }}>
            Great news! We found a potential match for your seat swap. 
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
            {description || "Someone is looking for what you have and has what you need!"} 
            
            {/* Here's the info:  */}
      
          </p>

          {/* <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#111827" }}>
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
          </p> */}
        </td>
      </tr>

      <tr>
        <td style={{ paddingTop: "12px", paddingBottom: "20px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#4b5563" }}>
        
              Don't wait too long—good matches go fast!
          </p>

          <Button href={url}>View Swap</Button>
        </td>
      </tr>
    </Layout>
  );
}
