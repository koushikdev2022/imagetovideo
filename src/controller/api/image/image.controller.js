const axios = require("axios");
const fs = require("fs");
const path = require("path");
const RunwayML = require("@runwayml/sdk");

exports.videoConvert = async (req, res) => {
    try {
        const apikey = process.env.API_KEY_IMAGE;

        if (!apikey) {
            return res.status(400).json({ msg: "API Key is missing", status: false });
        }

        // ✅ Initialize the client
        const client = new RunwayML({ apiKey: apikey });

        const task = await client.imageToVideo.create({
            model: "gen3a_turbo",
            promptImage: "https://imagetovideo.bestworks.cloud/uploads/images/1743672872485-garden-images-3.jpg",
            promptText: "Create a dynamic animation from this still image: Separate & animate foreground/background with parallax Add subtle environment effects (swaying leaves, drifting clouds) Include gentle particle effects where fitting Slow camera zoom in to characters, then zoom out Keep original colors and mood Ensure all movement feels natural and smooth",
            headers: {
                "X-Runway-Version": "2024-11-06",
                "Authorization": `Bearer ${apikey}`,
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
