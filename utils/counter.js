const counter = (operationType, req, res) => {
  if (req.session) {
    if (req.session.cookie.maxAge > 0) {
      if (!req.session.counter) {
        req.session.counter = 0;
      }
      operationType === "increase"
        ? req.session.counter++
        : req.session.counter--;
      req.session.touch();
      res.json({ counter: req.session.counter });
    } else {
      res.status(401).json({ error: "Unauthorized: Session expired" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized: Session not found" });
  }
};

module.exports = counter;
