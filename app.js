const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Check if notepadData.json exists, if not, create it with an empty array
const dataFilePath = "notepadData.json";
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, "[]");
}

// Routes
app.get("/", (req, res) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.render("index", { jsonData: "" });
      return;
    }
    res.render("index", { jsonData: data });
  });
});

app.post("/", (req, res) => {
  const newData = {
    id: Date.now(), // Use current timestamp as ID
    name: req.body.name,
    textarea: req.body.content,
  };

  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving data");
      return;
    }
    let dataArray = [];
    if (data) {
      dataArray = JSON.parse(data);
    }
    dataArray.push(newData);
    fs.writeFile(dataFilePath, JSON.stringify(dataArray, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error saving data");
        return;
      }
      res.redirect("/");
    });
  });
});

app.post("/delete/:id", (req, res) => {
  const idToDelete = parseInt(req.params.id);
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting data");
      return;
    }
    let dataArray = [];
    if (data) {
      dataArray = JSON.parse(data);
    }
    const updatedData = dataArray.filter((item) => item.id !== idToDelete);
    fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting data");
        return;
      }
      res.redirect("/");
    });
  });
});

// Admin route
// app.get('/admin', (req, res) => {
//     res.render('admin');
// });

app.get("/admin", (req, res) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.render("admin", { jsonData: "" });
      return;
    }
    res.render("admin", { jsonData: data });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
