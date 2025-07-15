// routes/eventRoutes.js
const express = require("express");
const router = express.Router();

const { createEvent } = require("../controllers/eventController");
router.post("/", createEvent); // POST /events

const { listUpcomingEvents } = require("../controllers/eventController");
router.get("/upcoming", listUpcomingEvents); // GET /events/upcoming

const { getEventDetails } = require("../controllers/eventController");
router.get("/:id", getEventDetails); // GET /events/:id

const { registerForEvent } = require("../controllers/eventController");
router.post("/:id/register", registerForEvent); // POST /events/:id/register

const { cancelRegistration } = require("../controllers/eventController");
router.delete("/:id/cancel", cancelRegistration); // DELETE /events/:id/cancel

const { getEventStats } = require("../controllers/eventController");
router.get("/:id/stats", getEventStats); // GET /events/:id/stats

module.exports = router;
