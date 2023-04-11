import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  const [game_id, language] = req.query.params;
  const data = await TwitchAPI.getStreamsByGame(game_id, language);
  res.status(200).json(data);
}
