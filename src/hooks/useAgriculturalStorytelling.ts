'use client';

import { useState, useCallback, useEffect } from 'react';
import { AgriculturalStoryManager, AgriculturalKnowledge, StoryThread, ContentEvolution } from '../lib/content/agricultural-storytelling';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';

interface UseAgriculturalStorytelling {
  seasonalContext: AgriculturalCycle;
  communityConsciousness: number;
}

export function useAgriculturalStorytelling({
  seasonalContext,
  communityConsciousness
}: UseAgriculturalStorytelling) {
  const [storyManager] = useState(() => 
    new AgriculturalStoryManager(seasonalContext, communityConsciousness)
  );

  const [activeStories, setActiveStories] = useState<StoryThread[]>([]);
  const [evolutionEvents, setEvolutionEvents] = useState<ContentEvolution[]>([]);

  // Update stories based on seasonal changes
  useEffect(() => {
    const stories = storyManager.getSeasonalStories();
    setActiveStories(stories);
  }, [seasonalContext.season]);

  // Trigger natural evolution cycles
  useEffect(() => {
    const evolutionInterval = setInterval(async () => {
      const evolutions = await Promise.all(
        activeStories.map((story: StoryThread) => storyManager.evolveContent(story.id))
      );
      
      const newEvolutions = evolutions.filter((e: ContentEvolution | null): e is ContentEvolution => e !== null);
      if (newEvolutions.length > 0) {
        setEvolutionEvents((prev: ContentEvolution[]) => [...prev, ...newEvolutions]);
      }
    }, 1000 * 60 * 60); // Check for evolution every hour

    return () => clearInterval(evolutionInterval);
  }, [activeStories]);

  const plantNewStory = useCallback(async (
    knowledge: Omit<AgriculturalKnowledge, 'id' | 'evolutionState' | 'createdAt' | 'lastEvolved'>
  ) => {
    const thread = await storyManager.plantStorySeed(knowledge);
    setActiveStories((prev: StoryThread[]) => [...prev, thread]);
    return thread;
  }, [storyManager]);

  const branchStory = useCallback(async (
    threadId: string,
    knowledge: Omit<AgriculturalKnowledge, 'id' | 'createdAt' | 'lastEvolved'>
  ) => {
    const branch = await storyManager.branchKnowledge(threadId, knowledge);
    if (branch) {
      setActiveStories(storyManager.getSeasonalStories());
    }
    return branch;
  }, [storyManager]);

  return {
    activeStories,
    evolutionEvents,
    plantNewStory,
    branchStory
  };
}