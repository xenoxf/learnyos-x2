import React, { useEffect, useMemo, useState } from "react";
import CardContent from "./Card";
import styles from "@/styles/flashCards/cardGrid.module.css";
import { Card, CardsDeck } from "@/types";
import { NotesSearch } from "../notes/NotesSearch";
import { Input } from "../ui/input";
import { apiService } from "@/services/apiService";
import { PiIcon, PyramidIcon } from "lucide-react";

export default function CardGrid() {
  const [inputChangeValue, setInputChangeValue] = useState<string>("");
  const [cards, setCards] = useState<CardsDeck[]>([]);
  
  
  const datos = useMemo(() => {
    const getCards = async () => {
      const cards = await apiService.getCardsOnly();
      const cardsFiltered = cards.filter((card) => card.description.includes(inputChangeValue) || card.title.includes(inputChangeValue));
      setCards(cardsFiltered);
    };
    getCards();
    return null;
  }, [inputChangeValue])

  return (
    <>
    <div className={styles["container"]}>
      <div className="container-search">
        <Input className="input-search" title="Esriba lo que busque" placeholder="Fisica..."  value={inputChangeValue} onChange={(e: any) => setInputChangeValue(e.target.avule)} />
        <button className="btn-filter"><PiIcon/> </button>
        <button className="btn-filter"><PyramidIcon/> </button>
      </div>
      <div className="container-grid">
        <div className="grid">
          {cards.map((card, index) => (
            <CardContent key={index} card={card} />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
