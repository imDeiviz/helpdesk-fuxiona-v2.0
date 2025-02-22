module.exports = (req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "mongodb+srv://dmrojassantana:mcXqOnlztBPqLlp7@fuxionahelpdesk.28xum.mongodb.net/"
  );

  res.header("Access-Control-Allow-Headers", "content-type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);


  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
