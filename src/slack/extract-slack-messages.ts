interface RawSlackMessage {
  username: string;
  text: string;
  attachments: any[];
  ts: string;
  reactions: RawSlackReactions[];
}

interface RawSlackReactions {
  name: string;
  users: string[];
  count: number;
}

/**
 * conversations.history から受け取ったAPIレスポンスからメッセージの履歴を抽出する
 * @see https://api.slack.com/methods/conversations.history
 */
function extractSlackMessages(slackApiResponse: any): RawSlackMessage[] {
  if (!slackApiResponse && !slackApiResponse.messages) {
    throw new Error("Slack APIレスポンスにメッセージの履歴がありません。");
  }

  return slackApiResponse.messages.map((message: any) => {
    return {
      username: message.username ?? "[名前がありません]",
      attachments: message.attachments ?? [],
      text: message.text ?? "",
      ts: message.ts ?? "0",
      reactions: message.reactions ?? [],
    };
  });
}
