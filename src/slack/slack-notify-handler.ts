interface SlackNotifyConfig {
  notifyChannelId: string;
  botToken: string;
}

class SlackNotifyHandler {
  private notifyChannelId;
  private botToken;

  constructor({ notifyChannelId, botToken }: SlackNotifyConfig) {
    this.notifyChannelId = notifyChannelId;
    this.botToken = botToken;
  }

  /**
   * 設定を取得するメソッド
   * @returns {SlackNotifyConfig}
   */
  public getConfig() {
    return {
      notifyChannelId: this.notifyChannelId,
      botToken: this.botToken,
    };
  }

  /**
   * 通知用のメソッド
   */
  public notifyToSlack(data: SlackMessage) {
    const url = "https://slack.com/api/chat.postMessage";

    const payload = {
      channel: this.notifyChannelId,
      blocks: this._formatDataForNotify(data),
    };

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.botToken}`,
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

  /**
   * エラー通知用のメソッド
   * @param error Error型を渡す
   * @returns
   */
  public notifyErrorToSlack = (error) => {
    const url = "https://slack.com/api/chat.postMessage";

    const payload = {
      channel: this.notifyChannelId,
      text: `:warning: *エラーが発生しました* :warning:
  \`\`\`
  ${error}
  \`\`\`
  `,
    };

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.botToken}`,
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
  };

  /**
   * 通知内容を整形するメソッド
   * @see https://api.slack.com/block-kit
   */
  private _formatDataForNotify(data: SlackMessage) {
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
}
