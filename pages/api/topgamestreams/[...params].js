import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  const [rank, language] = req.query.params;
  const data = await TwitchAPI.topGameStreams(rank, language);
  res.status(200).json(data);
}
