// controllers/eventController.js
const pool = require("../db/db");
const { validateEventInput } = require("../utils/validators");

exports.createEvent = async (req, res) => {
  try {
    const { title, datetime, location, capacity } = req.body;

    // 1️⃣ validate
    const check = validateEventInput({ title, datetime, location, capacity });
    if (!check.ok) return res.status(400).json({ error: check.msg });

    // 2️⃣ insert
    const text = `
      INSERT INTO events (title, datetime, location, capacity)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [title.trim(), datetime, location.trim(), capacity];

    const { rows } = await pool.query(text, values);

    // 3️⃣ success
    res.status(201).json({ eventId: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// controllers/eventController.js
exports.getEventDetails = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // 1️⃣ Get the event
    const eventQuery = "SELECT * FROM events WHERE id = $1";
    const eventResult = await pool.query(eventQuery, [eventId]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];

    // 2️⃣ Get registered users
    const regQuery = `
      SELECT u.id, u.name, u.email
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
    `;
    const regResult = await pool.query(regQuery, [eventId]);

    // 3️⃣ Combine and send
    res.status(200).json({
      ...event,
      registrations: regResult.rows
    });
  } catch (err) {
    console.error("getEventDetails error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(eventId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid event ID or user ID" });
    }

    // 1️⃣ Check if event exists
    const eventRes = await pool.query("SELECT * FROM events WHERE id = $1", [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    const event = eventRes.rows[0];

    // 2️⃣ Disallow past events
    const now = new Date();
    if (new Date(event.datetime) < now) {
      return res.status(400).json({ error: "Cannot register for past events" });
    }

    // 3️⃣ Check if user exists
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4️⃣ Check for duplicate registration
    const dupCheck = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2",
      [userId, eventId]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({ error: "User already registered" });
    }

    // 5️⃣ Check event capacity
    const countRes = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE event_id = $1",
      [eventId]
    );
    const currentCount = parseInt(countRes.rows[0].count);
    if (currentCount >= event.capacity) {
      return res.status(400).json({ error: "Event capacity is full" });
    }

    // 6️⃣ Register
    await pool.query(
      "INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)",
      [userId, eventId]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("registerForEvent error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.cancelRegistration = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(eventId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid event ID or user ID" });
    }

    // 1️⃣ Check if registration exists
    const regCheck = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2",
      [userId, eventId]
    );

    if (regCheck.rows.length === 0) {
      return res.status(400).json({ error: "User is not registered for this event" });
    }

    // 2️⃣ Delete the registration
    await pool.query(
      "DELETE FROM registrations WHERE user_id = $1 AND event_id = $2",
      [userId, eventId]
    );

    res.status(200).json({ message: "Registration cancelled" });
  } catch (err) {
    console.error("cancelRegistration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.listUpcomingEvents = async (req, res) => {
  try {
    const query = `
      SELECT id, title, datetime, location, capacity
      FROM events
      WHERE datetime > NOW()
      ORDER BY datetime ASC, location ASC
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error("listUpcomingEvents error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getEventStats = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // 1️⃣ Check if event exists
    const eventRes = await pool.query("SELECT capacity FROM events WHERE id = $1", [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    const capacity = parseInt(eventRes.rows[0].capacity);

    // 2️⃣ Count registrations
    const regRes = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE event_id = $1",
      [eventId]
    );
    const totalRegistrations = parseInt(regRes.rows[0].count);

    // 3️⃣ Calculate stats
    const remainingCapacity = capacity - totalRegistrations;
    const percentageUsed = ((totalRegistrations / capacity) * 100).toFixed(2) + "%";

    // 4️⃣ Return response
    res.status(200).json({
      totalRegistrations,
      remainingCapacity,
      percentageUsed
    });
  } catch (err) {
    console.error("getEventStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
