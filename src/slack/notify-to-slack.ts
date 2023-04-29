interface SlackMessage {
  // note: この型に合わせて通知に使うデータだけに絞ったJSONオブジェクトを作る
  text: string;
}

function notifyToSlack(
  data: SlackMessage,
  config: { botToken: string; notifyChannelId: string }
) {
  const url = "https://slack.com/api/chat.postMessage";

  const payload = {
    channel: config.notifyChannelId,
    blocks: _formatDataForNotify(data),
  };

  const params = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.botToken}`,
    },
    contentType: "application/json",
    payload: JSON.stringify(payload),
  } as unknown as GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const fetchResult = UrlFetchApp.fetch(url, params);
  const response = JSON.parse(fetchResult.getContentText());
  if (!response.ok) {
    throw new Error(`Slack API Error: ${response.error}`);
  }

  return response.ok;
}

// note: 通知内容を整形する関数
// @see https://api.slack.com/block-kit
function _formatDataForNotify(data: SlackMessage) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: data.text,
      },
    },
  ];
}
