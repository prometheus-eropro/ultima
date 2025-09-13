export default function handler(req, res) {
  return res.status(200).json({
    baseId: !!process.env.AIRTABLE_BASE_ID,
    token: !!process.env.AIRTABLE_TOKEN,
    node: process.version,
    now: new Date().toISOString()
  });
}
