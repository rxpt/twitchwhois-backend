import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  const data = await TwitchAPI.topGames({ first: req.query.rank });
  res.status(200).json(data);
}
