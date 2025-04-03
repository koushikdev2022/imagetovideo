const axios = require("axios");
const fs = require("fs");
const path = require("path");
const RunwayML = require("@runwayml/sdk");



exports.videoConvert = async (req, res) => {
    try {
        const apikey = process.env.API_KEY_IMAGE;
        const imageUrl = "https://imagetovideo.bestworks.cloud/uploads/images/1743672872485-garden-images-3.jpg";

        if (!apikey) {
            return res.status(400).json({ msg: "API Key is missing", status: false });
        }

        // ✅ Fetch image headers to get Content-Length
        let contentLength;
        try {
            const response = await axios.head(imageUrl);
            contentLength = response.headers["content-length"];

            if (!contentLength) {
                return res.status(400).json({ msg: "Content-Length header is missing.", status: false });
            }
        } catch (err) {
            console.error("Failed to fetch image headers:", err.message);
            return res.status(400).json({ msg: "Image is not accessible. Ensure it's publicly available.", status: false });
        }

        // ✅ Initialize RunwayML client
        const client = new RunwayML({ apiKey: apikey });

        // ✅ Send request with Content-Length
        const task = await client.imageToVideo.create({
            model: "gen3a_turbo",
            promptImage: imageUrl,
            promptText: "Create a dynamic animation from this still image: Separate & animate foreground/background with parallax Add subtle environment effects (swaying leaves, drifting clouds) Include gentle particle effects where fitting Slow camera zoom in to characters, then zoom out Keep original colors and mood Ensure all movement feels natural and smooth",
            headers: {
                "X-Runway-Version": "2024-11-06",
                "Authorization": `Bearer ${apikey}`,
                "Content-Length": contentLength, // ✅ Add Content-Length
            },
        });

        console.log("Task Created:", task);
        return res.status(200).json({ msg: "Task Created", task, status: true });

    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        return res.status(500).json({
            msg: error?.message || "Internal Server Error",
            status: false
        });
    }
};

