const fetch = require("node-fetch");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

exports.videoConvert = async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).json({ msg: "No image uploaded", status: false });
    }

    const imageUrl = `${process.env.SERVER_URL}/uploads/images/${req.file.filename}`;
    console.log("Generated Image URL:", imageUrl);

    // ✅ Fetch content-length
    // const imageUrl = "https://imagetovideo.bestworks.cloud/uploads/images/1743672872485-garden-images-3.jpg";

    // Fetch the image as a buffer
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image");
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const promptImage = req?.body?.prompt || "Create a dynamic animation from this still image: Separate & animate foreground/background with parallax Add subtle environment effects (swaying leaves, drifting clouds) Include gentle particle effects where fitting Slow camera zoom in to characters, then zoom out Keep original colors and mood Ensure all movement feels natural and smooth"
    const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        "X-Runway-Version": "2024-11-06",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptImage: `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`, // Convert image to Base64
        promptText: promptImage,
        duration: 5,
      }),
    });

    const task = await response.json();
    console.log("Task Created:", task);
    res.json({ success: true, task });
  } catch (error) {
    console.error("API Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};


exports.getTaskStatus = async (req, res) => {
    try {
      const { taskId } = req.body;
  
      // Fetch task status
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${process.env.RUNWAYML_API_SECRET}`,
          "X-Runway-Version": "2024-11-06",
        },
      });
  
      const taskStatus = await response.json();
      console.log("Task Status:", taskStatus);
  
      // Check if the task is completed and has a valid video URL
      if (taskStatus.status === "SUCCEEDED" && taskStatus.output?.length > 0) {
        const videoUrl = taskStatus.output[0]; // Extract video URL from the array
        console.log("Downloading video from:", videoUrl);
  
        // Define save path
        const videoDir = path.join(__dirname,"../../../../public/uploads/videos");
        if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  
        const videoPath = path.join(videoDir, `${taskId}.mp4`);
  
        // Download the video and save it locally
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) throw new Error("Failed to download video");
  
        const fileStream = fs.createWriteStream(videoPath);
        await new Promise((resolve, reject) => {
          videoResponse.body.pipe(fileStream);
          videoResponse.body.on("error", reject);
          fileStream.on("finish", resolve);
        });
  
        console.log("Video saved at:", videoPath);
  
        // Return the local video URL
        const localUrl = `${process.env.SERVER_URL}/uploads/videos/${taskId}.mp4`;
        return res.json({ success: true, taskStatus, videoUrl: localUrl });
      }
  
      // If the task is still processing
      res.json({ success: true, taskStatus });
    } catch (error) {
      console.error("API Error:", error);
      res.status(400).json({ success: false, error: error.message });
    }
  };