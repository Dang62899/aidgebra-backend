require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const auth = require("./middlewares/auth.middleware");
const logged = require("./middlewares/logged.middleware");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "8mb" }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());

const db =
  process.env.devmode == "true"
    ? process.env.MONGODBLOCAL
    : process.env.MONGODB;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log(err);
    if (err.name === "MongooseServerSelectionError") {
      // Contains a Map describing the state of your replica set. For example:
      // Map(1) {
      //   'localhost:27017' => ServerDescription {
      //     address: 'localhost:27017',
      //     type: 'Unknown',
      //     ...
      //   }
      // }
      console.log(err.reason.servers);
    }
  });

const connection = mongoose.connection;
connection.once("open", () => console.log("connected to mongoDB : " + db));

app.get("/test", async (req, res) => {
  try {
    return res.json({
      status: true,
      data: "Server working perfectly fine.",
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: true, error });
  }
});

app.use("/storage", express.static("storage"));

app.get("/init", async (req, res) => {
  try {
    // create admin account
    const { admin } = require("./models/admin/admin.schema");
    const bcrypt = require("bcrypt");

    const data = {
      email: "admin@example.com",
      password: "admin",
      fullname: "Admin",
    };
    const password = await bcrypt.hash(data.password, 10);
    const validateEmail = await admin.findOne({ email: data.email });
    if (validateEmail) throw "Email is already taken.";
    const entry = await admin.create([
      {
        email: data.email,
        password,
        fullname: data.fullname,
      },
    ]);
    return res.json({ status: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, error });
  }
});

app.get("/me", auth, async (req, res) => {
  try {
    return res.json({ status: true, data: req.user });
  } catch (error) {
    console.log(error);
    return res.json({ status: true, error });
  }
});

app.post("/api/logout", logged, (req, res) => {
  if (req.islogged == false) {
    return res.json({ status: false, message: "Not logged in" });
  }

  res.cookie("token", "", { maxAge: 1 });

  return res.json({ status: true, message: "Logged out" });
});

app.use("/api/admins", require("./routes/admin/routes"));
app.use("/api/teachers", require("./routes/teacher/routes"));
app.use("/api/students", require("./routes/student/routes"));

app.use("/api/classes", require("./routes/class/routes"));
app.use("/api/classroom/", require("./routes/classroom/routes"));
app.use("/api/lessons", require("./routes/class/lesson/routes"));
app.use("/api/pretest", require("./routes/class/lesson/pretest/routes"));
app.use("/api/posttest", require("./routes/class/lesson/posttest/routes"));
app.use("/api/concepts", require("./routes/class/lesson/concept/routes"));
app.use(
  "/api/lectures",
  require("./routes/class/lesson/concept/lecture/routes")
);
app.use(
  "/api/questions",
  require("./routes/class/lesson/concept/question/routes")
);

app.use("/api/monitoring", require("./routes/monitoring/routes"));

// V2
app.use("/api/v2/test", require("./routes/v2/test.routes"));
app.use("/api/v2/auth", require("./routes/v2/auth.routes"));
app.use("/api/v2/profile", require("./routes/v2/profile.routes"));
app.use("/api/v2/admins", require("./routes/v2/admin.routes"));
app.use("/api/v2/teachers", require("./routes/v2/teacher.routes"));
app.use("/api/v2/students", require("./routes/v2/student.routes"));
app.use("/api/v2/classes", require("./routes/v2/classes.routes"));
app.use("/api/v2/lessons", require("./routes/v2/lesson.routes"));
app.use("/api/v2/pretests", require("./routes/v2/pretest.routes"));
app.use("/api/v2/pretestresults", require("./routes/v2/pretest_result.routes"));
app.use("/api/v2/posttests", require("./routes/v2/posttest.routes"));
app.use("/api/v2/graph", require("./routes/v2/graph.routes"));
app.use(
  "/api/v2/posttestattempts",
  require("./routes/v2/posttest_attempt.routes")
);
app.use("/api/v2/concepts", require("./routes/v2/concept.routes"));
app.use("/api/v2/lectures", require("./routes/v2/lecture.routes"));
app.use("/api/v2/assesments", require("./routes/v2/assesment.routes"));
app.use(
  "/api/v2/conceptquestions",
  require("./routes/v2/concept_question.routes")
);
app.use(
  "/api/v2/pretestquestions",
  require("./routes/v2/pretest_question.routes")
);
app.use(
  "/api/v2/posttestquestions",
  require("./routes/v2/posttest_question.routes")
);
app.use("/api/v2/announcements", require("./routes/v2/announcement.routes"));
// app.use( "/api/v2/question", require( "./routes/v2/question.routes" ) );
// app.use( "/api/v2/monitoring", require( "./routes/v2/monitoring.routes" ) );

server.listen(port, () => console.log(`server runs at ${port}`));
