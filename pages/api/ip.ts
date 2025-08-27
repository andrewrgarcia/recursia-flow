import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ipwho.is is free (no key needed)
    const r = await fetch("https://ipwho.is/", { cache: "no-store" });
    const data = await r.json();

    const out = {
      country_code: data?.country_code || "",
      country: data?.country || "",
      city: data?.city || "",
      region: data?.region || data?.region_name || "",
      timezone: data?.timezone?.id || data?.timezone || "",
      utc_offset: data?.timezone?.utc || ""
    };

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json({
      country_code: "",
      country: "",
      city: "",
      region: "",
      timezone: "",
      utc_offset: ""
    });
  }
}
