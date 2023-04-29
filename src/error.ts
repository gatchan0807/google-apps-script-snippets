function notifyErrorToSlack(
  error: Error,
  config: {
    botToken: string;
    notifyChannelId: string;
  }
) {
  const url = "https://slack.com/api/chat.postMessage";

  const payload = {
    channel: config.notifyChannelId,
    text: `:warning: *エラーが発生しました* :warning:
\`\`\`
${error}
\`\`\`
`,
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
