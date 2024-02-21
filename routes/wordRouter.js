const express = require("express");
const router = express.Router();
const http = require("http");
const { response } = require("../server");

// DictionaryAPI endpoint
const API_URL = "http://api.dictionaryapi.dev/api/v2/entries/en";
const RANDOM_WORD = "http://random-word-api.herokuapp.com/word";

// Route to handle requests for random word
router.get("/", async (req, res) => {
  try {
    const randomDef = await defineRandomWord();
    res.render("index", { word: randomDef });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

async function getRandomWord() {
  return new Promise((resolve, reject) => {
    http.get(RANDOM_WORD, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        try {
          const randomWord = JSON.parse(data)[0];
          console.log(randomWord);
          resolve(randomWord);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

// Function to fetch random word from DictionaryAPI
async function defineRandomWord() {
  const randomWord = await getRandomWord();
  console.log(randomWord);
  return new Promise((resolve, reject) => {
    http
      .get(`${API_URL}/${randomWord}`, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            const wordData = JSON.parse(data)[0];
            const randomDef = {
              word: wordData.word,
              pronunciation: wordData.phonetics[0].text,
              definition: wordData.meanings[0].definitions[0].definition,
            };
            resolve(randomDef);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

module.exports = router;
