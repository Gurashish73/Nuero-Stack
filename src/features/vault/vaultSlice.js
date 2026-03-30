import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [
    {
      id: '1',
      front: 'What is Neuroplasticity?',
      back: "The brain's ability to reorganize itself by forming new neural connections.",
      topic: 'Neuroscience',
      interval: 0, 
      easeFactor: 2.5, 
      nextReview: Date.now(), 
    }
  ],
};

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    addCard: (state, action) => {
      state.cards.push({
        id: Date.now().toString(),
        front: action.payload.front,
        back: action.payload.back,
        topic: action.payload.topic || 'Custom Concept',
        interval: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
      });
    },
    
    injectAICards: (state, action) => {
      const newCards = action.payload.cards.map((card, index) => ({
        id: Date.now().toString() + '-' + index,
        front: card.front,
        back: card.back,
        topic: action.payload.topic,
        interval: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
      }));
      state.cards.push(...newCards);
    },
    hydrateVault: (state, action) => {
      return { ...state, ...action.payload };
    },
    reviewCard: (state, action) => {
      const { id, quality } = action.payload; 
      const card = state.cards.find(c => c.id === id);
      if (!card) return;

      if (quality === 1) {
        card.interval = 0;
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
      } else {
        if (card.interval === 0) {
          card.interval = 1; 
        } else if (card.interval === 1) {
          card.interval = 3; 
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }
        
        if (quality === 2) card.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
        if (quality === 4) card.easeFactor += 0.15;
      }

      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      card.nextReview = Date.now() + (card.interval * ONE_DAY_MS);
    }
  }
});

export const { addCard, injectAICards, reviewCard, hydrateVault } = vaultSlice.actions;
export default vaultSlice.reducer;