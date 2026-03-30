import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodes: [
    {
      id: 'react-mastery',
      title: 'MERN Stack Mastery',
      description: 'Complete the Mathify and SoulBloom projects to solidify Full Stack fundamentals.',
      status: 'unlocked',
      category: 'frontend',
      position: { x: 15, y: 50 }, 
      unlocks: ['python-basics', 'math-foundations'] 
    },
    {
      id: 'python-basics',
      title: 'Python for AI',
      description: 'Syntax, Pandas, NumPy, and data manipulation.',
      status: 'locked', 
      category: 'backend',
      position: { x: 40, y: 25 },
      unlocks: ['ml-models']
    },
    {
      id: 'math-foundations',
      title: 'Linear Algebra & Calc',
      description: 'The mathematical engine behind neural networks.',
      status: 'locked',
      category: 'theory',
      position: { x: 40, y: 75 },
      unlocks: ['ml-models']
    },
    {
      id: 'ml-models',
      title: 'Machine Learning Core',
      description: 'Scikit-learn, regression, classification, and model evaluation.',
      status: 'locked',
      category: 'ai',
      position: { x: 65, y: 50 },
      unlocks: ['deep-learning']
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning & Neural Nets',
      description: 'TensorFlow/PyTorch, CNNs, and building real AI architectures.',
      status: 'locked',
      category: 'mastery',
      position: { x: 90, y: 50 },
      unlocks: []
    }
  ],

  crossTrainingActive: false,
  crossTrainingMessage: ''
};

const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    // Handles completing a node and unlocking its children
    completeNode: (state, action) => {
      const nodeId = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      
      if (node && node.status === 'unlocked') {
        // Mark current node as completed
        node.status = 'completed';
        
        // Unlock the child nodes
        node.unlocks.forEach(childId => {
          const childNode = state.nodes.find(n => n.id === childId);
          if (childNode) {
            childNode.status = 'unlocked';
          }
        });

        state.crossTrainingActive = true;
        state.crossTrainingMessage = `Node '${node.title}' secured. The brain requires a novelty shift to consolidate this skill. Recommended: 15 minutes of physical movement or unrelated creative work.`;
      }
    },
    
    dismissCrossTraining: (state) => {
      state.crossTrainingActive = false;
      state.crossTrainingMessage = '';
    },

    // Architect Mode
    addNode: (state, action) => {
      const { title, description, category, position, parentId } = action.payload;
      const newNodeId = `node-${Date.now()}`;
      
      let initialStatus = 'locked';

      // Wire it to the parent AND check for dead-ends
      if (parentId && parentId !== 'none') {
        const parent = state.nodes.find(n => n.id === parentId);
        if (parent) {
          parent.unlocks.push(newNodeId);
          if (parent.status === 'completed') {
            initialStatus = 'unlocked';
          }
        }
      } else if (parentId === 'none' && state.nodes.length === 0) {
        initialStatus = 'unlocked';
      }

      state.nodes.push({
        id: newNodeId,
        title,
        description,
        status: initialStatus,
        category,
        position,
        unlocks: [] 
      });
    },

    // AI Auto-Router
    injectAITree: (state, action) => {
      state.nodes = action.payload;
      state.crossTrainingActive = false;
    },
    hydrateJourney: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { completeNode, dismissCrossTraining, addNode, injectAITree, hydrateJourney } = journeySlice.actions;
export default journeySlice.reducer;