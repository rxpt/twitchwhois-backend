import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  try {
    const [userId, after, before] = req.query.params;
    const params = before ? { before } : { after };
    const data = await TwitchAPI.getClips(userId, params);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(404).send("404");
  }
}
