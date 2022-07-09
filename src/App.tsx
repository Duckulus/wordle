import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "wordle/words.json";
const WORD_LENGTH = 5;
const LINES = 6;
let KNOWN_WORDS: string[];

function Wordle() {
  const [solution, setSolution] = useState("");
  const [words, setWords] = useState(Array(LINES).fill(null));
  const [currentWord, setCurrentWord] = useState("");
  const [ended, setEnded] = useState(false);
  const [hint, setHint] = useState("");

  (window as any).solution = () => {
    return solution;
  };

  useEffect(() => {
    const fetchWords = async () => {
      const resp = await fetch(API_URL);
      const fetchedWords = await resp.json();
      KNOWN_WORDS = fetchedWords;
      const word =
        fetchedWords[Math.floor(Math.random() * fetchedWords.length)];

      setSolution(word);
    };
    fetchWords();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (ended) return;

      // Generates an alphabet array
      const alphabet = [...Array(26)].map((_, i) =>
        String.fromCharCode(i + 97)
      );

      if (
        alphabet
          .map((letter) => `key${letter}`)
          .includes(event.code.toLowerCase())
      ) {
        if (currentWord.length < WORD_LENGTH)
          setCurrentWord(currentWord + event.key);
      } else if (event.key === "Enter") {
        if (currentWord.length === WORD_LENGTH) {
          if (!KNOWN_WORDS.includes(currentWord.toUpperCase())) {
            setHint("Unknown Word");
            return;
          }
          setHint("");
          const newWords = words.slice();
          const emptyIndex = words.findIndex((word) => !word);
          newWords[emptyIndex] = currentWord;
          if (currentWord.toUpperCase() === solution) {
            setEnded(true);
            setHint("Congratulations, You won!");
          } else if (emptyIndex + 1 === LINES) {
            setEnded(true);
            setHint(`You lost! Solution: ${solution}`);
          }

          setWords(newWords);
          setCurrentWord("");
        }
      } else if (event.key === "Backspace") {
        setCurrentWord(currentWord.slice(0, -1));
        setHint("");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="board">
      <h1 className={"title"}>Wordle</h1>
      {words.map((value, i) => {
        const isCurrent = i === words.findIndex((word) => !word);
        const isFinished = !!words[i];
        return (
          <Line
            key={i}
            word={isCurrent ? currentWord : value || ""}
            solution={solution}
            finished={isFinished}
          />
        );
      })}
      <p className={"hint"}>{hint}</p>
    </div>
  );
}

function Line({
  word,
  solution,
  finished,
}: {
  word: string;
  solution: string;
  finished: boolean;
}) {
  const tiles: string[] = Array(WORD_LENGTH).fill("");
  let solutionCopy = solution;
  //The correct letters get checked first
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (word[i]?.toUpperCase() === solutionCopy[i]) {
      tiles[i] = "green";
      solutionCopy = solutionCopy.replace(word[i]?.toUpperCase(), " ");
    }
  }
  //If a letter occurs more often in the word than in the solution, it will be only marked as many times as it occurs in the solution
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (solutionCopy.includes(word[i]?.toUpperCase())) {
      tiles[i] = "orange";
      solutionCopy = solutionCopy.replace(word[i]?.toUpperCase(), " ");
    }
  }

  return (
    <div className={"line"}>
      {tiles.map((value, i) => {
        return (
          <div key={i} className={`tile ${finished ? tiles[i] : ""}`}>
            {word[i]}
          </div>
        );
      })}
    </div>
  );
}

export default Wordle;
