interface SlackCrawlConfig {
  crawlTargetChannelId: string;
  botToken: string;
  limit: number;
}

interface SlackMessage {
  username: string;
  text: string;
  attachmentText: string;
  ts: string;
  reactionNames: string[];
}

interface RawSlackMessage {
  username: string;
  attachments?: any[];
  text?: string;
  ts: string;
  reactions: RawSlackReactions[];
}

interface RawSlackReactions {
  name: string;
  users: string[];
  count: number;
}

class SlackCrawlHandler {
  private crawlTargetChannelId: string;
  private botToken: string;
  private limit: number;
  public slackMessages: SlackMessage[] = [];

  constructor({ crawlTargetChannelId, botToken, limit }: SlackCrawlConfig) {
    this.crawlTargetChannelId = crawlTargetChannelId;
    this.botToken = botToken;
    this.limit = limit;
  }

  /**
   * 設定を取得するメソッド
   * @returns {SlackCrawlConfig}
   */
  public getConfig() {
    return {
      crawlTargetChannelId: this.crawlTargetChannelId,
      botToken: this.botToken,
      limit: this.limit,
    };
  }

  /**
   * Slack APIから指定のチャンネルの履歴を取得する関数
   * @param {number} oldest - 取得するメッセージの最古のts
   */
  public crawlSlackMessages({ oldest }: { oldest: number }): SlackMessage[] {
    const response = this._fetchSlackConversationsApi({
      limit: this.limit,
      oldest,
    });
    const rawSlackMessages = this._extractSlackMessages(response);

    const slackMessages = rawSlackMessages.map((rawSlackMessage) => {
      return this._convertSlackMessage(rawSlackMessage);
    });

    const sortedSlackMessages = slackMessages.sort((a, b) => {
      return a.ts > b.ts ? 1 : -1;
    });

    this.slackMessages = sortedSlackMessages;
    return sortedSlackMessages;
  }

  /**
   * Slack APIにfetchする関数
   * @param {number} limit 取得の上限数（デフォルトは100で、APIの最大値は1000）
   * @returns
   */
  private _fetchSlackConversationsApi({
    limit,
    oldest,
  }: {
    limit: number;
    oldest: number;
  }): unknown {
    const url = `https://slack.com/api/conversations.history`;
    const params = {
      method: "POST",
      contentType: "application/json; charset=utf-8",
      headers: {
        Authorization: `Bearer ${this.botToken}`,
      },
      payload: JSON.stringify({
        channel: this.crawlTargetChannelId,
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

  /**
   * Slack APIのレスポンスからメッセージの履歴を抽出する関数
   */
  private _extractSlackMessages(slackApiResponse: any): RawSlackMessage[] {
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

  /**
   * メッセージの履歴をSlackMessage型に整形する関数
   */
  private _convertSlackMessage(rawSlackMessage: RawSlackMessage): SlackMessage {
    const attachmentText =
      rawSlackMessage.attachments
        ?.map((attachment) => {
          // note: fallbackやcolor、pretextなどが入ってくるが、ここで無視している
          return attachment.text;
        })
        .join(" / ") ?? "";

    const reactionNames = rawSlackMessage.reactions
      ? rawSlackMessage.reactions.map((reaction) => {
          return reaction.name;
        })
      : [];
    return {
      username: rawSlackMessage.username,
      text: rawSlackMessage.text ?? "",
      ts: rawSlackMessage.ts,
      reactionNames,
      attachmentText,
    };
  }
}
