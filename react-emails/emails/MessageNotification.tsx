import * as React from "react";
import { Layout } from "../components/Layout";

type Props = {
  userName?: string
  url?: string
}
export default function MessageNotification({
    userName = "there",
    url = "https://switchwith.me/messages",
}: Props) {
  return (
    <Layout>
      <tr>
        <td style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151" }}>
          <p style={{ margin: "0 0 16px 0" }}>
            Hi {userName},</p>
          
          <p style={{ margin: "0 0 16px 0" }}>
            You have a new message on Switch With Me. Reply here: {url}
          </p>
          <p style={{ margin: "0 0 16px 0" }}>
            Thanks,<br/>
            The Switch With Me Team
          </p>
        </td>
      </tr>
    </Layout>
  );
}
