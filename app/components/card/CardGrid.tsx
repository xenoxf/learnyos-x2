import React, { useEffect, useState } from "react";
import CardContent from "./Card";
import styles from "@/styles/flashCards/cardGrid.module.css";
import { Card, CardsDeck } from "@/types";
import { NotesSearch } from "../notes/NotesSearch";
import { Input } from "../ui/input";
import { apiService } from "@/services/apiService";

export default function CardGrid() {
  const [inputChangeValue, setInputChangeValue] = useState<string>("");
  const [cards, setCards] = useState<CardsDeck[]>([]);
  const refresh = async () => {
    const load = await apiService.getExamsOnly();
  };
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Input onChange={(e: any) => setInputChangeValue(e.target.value)} />
      {}
    </>
  );
}
