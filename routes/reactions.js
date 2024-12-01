import express from "express";
import * as stream from "getstream";

import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/resparkle", auth, async (req, res) => {
    try {
        const { hasResparkled, actorId, kind, sparkleId } = req.body;

        const client = stream.connect(
            process.env.feedApiKey,
            process.env.feedSecretKey,
            process.env.streamAppId
        );
        if (!client)
            return res.status(500).send({ error: "Client couldn't be initialised" });

        if (
            typeof hasResparkled === "string"
                ? hasResparkled === "true"
                : hasResparkled
        ) {
            const response = await client.reactions.filter({
                activity_id: sparkleId,
                kind,
            });

            if (response.results.length === 0)
                return res.status(404).send({ error: "Reaction not found for the activity" });

            const reactionId = response.results[0].id;
            await client.reactions.delete(reactionId);

            res.send(response);
        } else {
            const response = await client.reactions.add(
                kind,
                sparkleId,
                { id: actorId },
                { targetFeeds: getTargetFeeds(req.user._id !== actorId, hasResparkled) }
            );

            res.send(response)
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

function getTargetFeeds(notActor, hasResparkled) {
    const feeds = [];

    if (!hasResparkled && notActor) feeds.push(`notification:${actorId}`);

    return feeds;
}

export default router;
