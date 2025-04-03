const axios = require("axios");
const fs = require("fs");
const path = require("path");
const RunwayML = require("@runwayml/sdk");

exports.videoConvert = async (req, res) => {
    try {
        const apikey = process.env.API_KEY_IMAGE;
        const SERVER_URL = process.env.SERVER_URL;

        if (!apikey) {
            return res.status(400).json({ msg: "API Key is missing", status: false });
        }

        if (!req.file) {
            return res.status(400).json({ msg: "No image uploaded", status: false });
        }

        const imagePath = req.file.path;
        const imageExtension = path.extname(imagePath).toLowerCase();
        const allowedFormats = [".jpg", ".jpeg", ".png"];

        if (!allowedFormats.includes(imageExtension)) {
            return res.status(400).json({ msg: "Unsupported image format. Use JPG or PNG.", status: false });
        }

        const imageUrl = `${SERVER_URL}/uploads/images/${req.file.filename}`;
        console.log("Generated Image URL:", imageUrl);

        // ✅ Check if the image URL is accessible
        try {
            const response = await axios.get(imageUrl);
            if (response.status !== 200) {
                return res.status(400).json({ msg: "Uploaded image is not accessible.", status: false });
            }
        } catch (err) {
            console.error("Image URL not accessible:", err.message);
            return res.status(400).json({ msg: "Uploaded image is not accessible.", status: false });
        }

        const promptText = req.body.promptText || "Create a dynamic animation from this still image.";

        const client = new RunwayML({ apiKey: apikey });

        // ✅ Call RunwayML API without Content-Length
        const task = await client.imageToVideo.create({
            model: "gen3a_turbo",
            promptImage: imageUrl,
            promptText,
            headers: {
                "X-Runway-Version": "2024-11-06", // ✅ Required version header
                "Authorization": `Bearer ${apikey}`, // ✅ Include Authorization header
            }
        });

        console.log("Task ID:", task.id);

        let videoUrl = null;
        while (!videoUrl) {
            const taskResponse = await client.tasks.get(task.id);
            if (taskResponse.status === "completed") {
                videoUrl = taskResponse.output.video;
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        const videoPath = path.join(__dirname, "../../public/uploads/videos/", `${Date.now()}-output.mp4`);
        const writer = fs.createWriteStream(videoPath);
        const videoStream = await axios({ url: videoUrl, method: "GET", responseType: "stream" });

        videoStream.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

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
