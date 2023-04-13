import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  try {
    const [userId, after, before] = req.query.params;
    const data = await TwitchAPI.getClips(userId, {
      after,
      before,
    });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(404).send("404");
  }
}
