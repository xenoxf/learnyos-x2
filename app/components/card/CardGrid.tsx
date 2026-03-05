import React from 'react'
import CardContent from './Card'
import styles from '@/styles/flashCards/cardGrid.module.css';
import { Card } from '@/types';

export default function CardGrid({cards}: {cards: Card[]}) {
  return (
    <div className={styles.container}  >
        {cards.map((card, index) => (
            <CardContent key={index} card={card} />
        ))}
    </div>
  )
}
