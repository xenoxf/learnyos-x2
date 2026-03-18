import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { GenerateFlashCardData } from '@/types';
import React, { useState } from 'react'

function CrearCard() {
    const [cardDto, setCardDto] = useState<GenerateFlashCardData>({
        reference: '',
        quantity: 5,
        acceso: 'public'
    });
    const handleCreateCard = () => {
        if(cardDto.quantity <= 0 || (cardDto.acceso !== 'public' && cardDto.acceso !== 'private')) {
            toast({
                title: 'Error',
                description: 'Por favor, complete todos los campos correctamente.',
                variant: 'destructive'
            })
        }
        const response = apiService.generateFlashcards(cardDto);
    }
  return (
    <>
    <div className="container">
        <div className="container-input-context">

        </div>
        <input type="number" placeholder="Cantidad" value={cardDto.quantity} onChange={(e) => setCardDto({...cardDto, quantity: parseInt(e.target.value)})} />
        <select value={cardDto.acceso} onChange={(e) => setCardDto({...cardDto, acceso: e.target.value})}>
            <option value="public">Público</option>
            <option value="private">Privado</option>
        </select>
        <button onClick={handleCreateCard}>Crear Card</button>
    </div>
    </>
  )
}

export default CrearCard;