import type { Card as CardType } from '@/types/index'
import React from 'react'
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Card, CardDescription, CardTitle } from '../ui/card';

const CardContent: React.FC<{ card: CardType }> = ({ card }) => {
  return (
    <Card>
    <CardTitle> {card.title} </CardTitle>
    <CardDescription >
        <MarkdownRenderer content={card.description} />
    </CardDescription>
    </Card>
  )
}

export default CardContent;
