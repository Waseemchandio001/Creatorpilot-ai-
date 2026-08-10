
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/Wan-AI/Wan2.2-TI2V-5B",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: errorText
      });
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("video")) {
      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", buffer.length);

      return res.send(buffer);
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
