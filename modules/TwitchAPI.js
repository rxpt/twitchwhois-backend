import axios from "axios";

class TwitchAPI {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.API_HELIX = axios.create({
      baseURL: "https://api.twitch.tv/helix/",
      headers: {
        "Client-Id": clientId,
      },
    });
  }

  async getToken() {
    try {
      if (this.token !== null && this.tokenExpirationTime !== null) {
        const now = Date.now();
        if (now < this.tokenExpirationTime) {
          return this.token;
        }
      }

      const response = await axios.post(
        "https://id.twitch.tv/oauth2/token",
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: "client_credentials",
          },
        }
      );

      this.token = response.data.access_token;
      this.tokenExpirationTime = Date.now() + response.data.expires_in * 1000;

      return this.token;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getUser(username) {
    try {
      const token = await this.getToken();

      const response = await this.API_HELIX.get("users", {
        params: { login: username },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data[0] ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getFollows(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("users/follows", {
        params: {
          to_id: userId,
          first: 1,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.total ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getChannelEmotes(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("chat/emotes", {
        params: {
          broadcaster_id: userId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getChannelBadges(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("chat/badges", {
        params: {
          broadcaster_id: userId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getChannel(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("channels", {
        params: { broadcaster_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.data[0];
      user.follows = await this.getFollows(userId);

      return user ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getStream(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("streams", {
        params: { user_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data[0] ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getStreamSchedule(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("schedule", {
        params: { broadcaster_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getClips(userId, options = null) {
    try {
      const params = { first: 10, ...options, broadcaster_id: userId };
      const token = await this.getToken();
      const response = await this.API_HELIX.get("clips", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getVideos(userId, options = null) {
    try {
      const params = {
        first: 10,
        sort: "trending",
        ...options,
        user_id: userId,
      };
      const token = await this.getToken();
      const response = await this.API_HELIX.get("videos", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async chatSettings(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("chat/settings", {
        params: { broadcaster_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async userChatColor(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("chat/color", {
        params: { user_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data[0] ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async currentSoundtrack(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("soundtrack/current_track", {
        params: { broadcaster_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getAllData(username) {
    try {
      const user = await this.getUser(username);
      if (!user || !user.id) {
        throw new TypeError("Não foi possivel encontrar este usuário");
      }
      user.color = (await this.userChatColor(user.id))?.color;
      user.channel = await this.getChannel(user.id);
      user.chatstate = await this.chatSettings(user.id);
      user.stream = await this.getStream(user.id);
      user.soundtrack = user.stream
        ? await this.currentSoundtrack(user.id)
        : null;
      user.schedule = await this.getStreamSchedule(user.id);
      user.badges = await this.getChannelBadges(user.id);
      user.emotes = await this.getChannelEmotes(user.id);
      user.videos = await this.getVideos(user.id);
      user.clips = await this.getClips(user.id);

      return user;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async topGames(params = null) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("games/top", {
        params: { first: 10, ...params },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getStreamsByGame(game_id, language = null, limit = 10) {
    try {
      const token = await this.getToken();
      const params = {
        game_id,
        first: limit,
        type: "live",
      };
      if (typeof language == "string" && language.length == 2) {
        params.language = language.toLowerCase();
      }
      const response = await this.API_HELIX.get("streams", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data ?? null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async topGameStreams(rank = 5, language = null) {
    const topgames = await this.topGames();
    if (topgames) {
      const response = Promise.all(
        topgames.map(async (game) => {
          game.streams = await this.getStreamsByGame(game.id, language, rank);
          return game;
        })
      );
      return response;
    }
    return null;
  }
}

const twitchAPI = new TwitchAPI(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

export default twitchAPI;
