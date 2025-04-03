import RunwayML from "@runwayml/sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET, // Securely use env variable
  headers: {
    "X-Runway-Version": "2024-11-06",
  },
});

export const videoConvert = async (req, res) => {
  try {
    const task = await client.imageToVideo.create({
      model: "gen3a_turbo",
      promptImage: "https://imagetovideo.bestworks.cloud/uploads/images/1743672872485-garden-images-3.jpg",
      promptText: "Create a dynamic animation from this still image: Separate & animate foreground/background with parallax. Add subtle environment effects (swaying leaves, drifting clouds). Include gentle particle effects where fitting. Slow camera zoom in to characters, then zoom out. Keep original colors and mood. Ensure all movement feels natural and smooth.",
    });

    console.log("Task Created:", task);
    res.json({ success: true, task });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(400).json({ success: false, error: error.response?.data || error.message });
  }
};
