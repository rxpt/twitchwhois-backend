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
      return null;
    }
  }

  async getClips(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("clips", {
        params: { user_id: userId, first: 3 },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      return null;
    }
  }

  async getVideos(userId) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("videos", {
        params: { user_id: userId, first: 3 },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      return null;
    }
  }

  async getAllData(username) {
    try {
      const user = await this.getUser(username);
      if (!user || !user.id) {
        throw new TypeError("Não foi possivel encontrar este usuário");
      }
      user.channel = await this.getChannel(user.id);
      user.stream = await this.getStream(user.id);
      user.badges = await this.getChannelBadges(user.id);
      user.emotes = await this.getChannelEmotes(user.id);
      user.videos = await this.getVideos(user.id);
      user.clips = await this.getClips(user.id);
    } catch (err) {
      return null;
    }
  }

  async topGames(rank = 10) {
    try {
      const token = await this.getToken();
      const response = await this.API_HELIX.get("videos", {
        params: { first: rank },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data ?? null;
    } catch (err) {
      return null;
    }
  }
}

const twitchAPI = new TwitchAPI(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

export default twitchAPI;
