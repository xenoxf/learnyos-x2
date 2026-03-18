import type { CardsDeck } from '@/types/index'
import React from 'react'
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Card, CardDescription, CardTitle } from '../ui/card';

const CardContent: React.FC<{ card: CardsDeck }> = ({ card }) => {
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
