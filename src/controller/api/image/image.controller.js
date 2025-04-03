const RunwayML = require("@runwayml/sdk");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");



// Video conversion function
exports.videoConvert = async (req, res) => {
    try {
        const apikey = process.env.API_KEY_IMAGE;
        const SERVER_URL = process.env.SERVER_URL
        if (!apikey) {
            return res.status(400).json({ msg: "API Key is missing", status: false });
        }

        // Ensure file is uploaded
        if (!req.file) {
            return res.status(400).json({ msg: "No image uploaded", status: false });
        }

        const imagePath = req.file.path;
        const promptText = req.body.promptText || "Create a dynamic animation from this still image: Separate & animate foreground/background with parallax Add subtle environment effects (swaying leaves, drifting clouds) Include gentle particle effects where fitting Slow camera zoom in to characters, then zoom out Keep original colors and mood Ensure all movement feels natural and smooth";

        // Upload image to a public URL (assuming you have an upload service)
        const imageUrl = `${SERVER_URL}/uploads/images/${req.file.filename}`;
        console.log(imageUrl)
        const client = new RunwayML({ apiKey: apikey });

        // Request video conversion
        const task = await client.imageToVideo.create({
            model: "gen3a_turbo",
            promptImage: imageUrl,
            promptText,
        });

        console.log("Task ID:", task.id);

        // Polling for video status
        let videoUrl = null;
        while (!videoUrl) {
            const response = await client.tasks.get(task.id);
            if (response.status === "completed") {
                videoUrl = response.output.video; // The generated video URL
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }

        // Download and save video
        const videoPath = path.join(__dirname, "../../public/uploads/videos/", `${Date.now()}-output.mp4`);
        const writer = fs.createWriteStream(videoPath);
        const videoStream = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
        });

        videoStream.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        // Return the saved video URL
        return res.status(200).json({
            msg: "Video processing completed",
            videoUrl: `${SERVER_URL}/uploads/videos/${path.basename(videoPath)}`,
            status: true,
        });

    } catch (err) {
        console.error("Error in videoConvert:", err);
        return res.status(500).json({
            msg: err?.message || "Internal Server Error",
            status: false
        });
    }
};


