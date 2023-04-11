import TwitchAPI from "@/modules/TwitchAPI";

export default async function handler(req, res) {
  try {
    const data = await TwitchAPI.getAllData(req.query.username);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(404).send("404");
  }
}
