import React from "react";
import { render, screen } from "@testing-library/react";
import Wordle from "./App";

test("renders title", () => {
  render(<Wordle />);
  const linkElement = screen.getByText(/Wordle/i);
  expect(linkElement).toBeInTheDocument();
});
