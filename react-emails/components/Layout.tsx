// react-emails/components/Layout.tsx
import * as React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f5f3ff",
        padding: "32px 0",
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={{ margin: "0 auto", maxWidth: "600px" }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "12px 0 8px 0",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg,#e0f2fe,#fef3c7)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#4b5563",
                }}
              >
                Switch With Me
              </span>
            </td>
          </tr>

          <tr>
            <td
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111827",
                textAlign: "center",
                padding: "4px 24px 16px 24px",
              }}
            >
              <span>Seat Swap Notification</span>
            </td>
          </tr>

          <tr>
            <td>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
                style={{
                  borderRadius: "14px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "24px",
                }}
              >
                <tbody>{children}</tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                textAlign: "center",
                paddingTop: "20px",
              }}
            >
              <p style={{ margin: "0" }}>
                You’re receiving this because your notifications are enabled. 
              </p>
              <p style={{ margin: "4px 0 0 0" }}>© 2025 Switch With Me</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
