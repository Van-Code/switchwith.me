import { Layout } from "../components/Layout";

export default function MinimalTemplate({
    userName = "there",
    url = "https://switchwith.me/messages",
}: {
   userName: string;
   url:string
}) {
  return (
    <Layout>
      <tr>
        <td style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151" }}>
          <p style={{ margin: "0 0 16px 0" }}>
            Hi {userName},</p>
          
          <p style={{ margin: "0 0 16px 0" }}>
            You have a new notification on Switch With Me. View it here: {url}
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
