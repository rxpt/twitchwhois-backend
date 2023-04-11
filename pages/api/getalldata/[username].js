import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  const data = await TwitchAPI.getAllData(req.query.username);
  res.status(200).json(data);
}
