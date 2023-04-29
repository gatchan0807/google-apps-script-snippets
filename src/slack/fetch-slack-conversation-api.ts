function fetchSlackConversationsApi({
  limit,
  oldest,
  config,
}: {
  limit: number;
  oldest: number;
  config: { botToken: string; crawlTargetChannelId: string };
}): unknown {
  const url = `https://slack.com/api/conversations.history`;
  const params = {
    method: "POST",
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: `Bearer ${config.botToken}`,
    },
    payload: JSON.stringify({
      channel: config.crawlTargetChannelId,
      limit,
      oldest,
    }),
  } as unknown as GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const response = UrlFetchApp.fetch(url, params);
  const json = response.getContentText();
  const data = JSON.parse(json);

  if (!data.ok) {
    throw new Error(data.error);
  }
  return data;
}
