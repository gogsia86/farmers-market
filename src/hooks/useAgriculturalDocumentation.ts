'use client';

import { useState, useCallback, useEffect } from 'react';
import { LivingDocumentationSystem, LivingDocument, DocumentRevision, DocumentType } from '../lib/content/living-documentation';
import type { AgriculturalCycle } from '../lib/navigation/agricultural-types';
import type { WisdomDepth } from '../lib/content/agricultural-storytelling';
import type { AgriculturalKnowledge } from '../lib/content/agricultural-storytelling';
import type { CommunityContribution } from '../lib/empathy/community-engagement';

interface UseAgriculturalDocumentationProps {
  seasonalContext: AgriculturalCycle;
  communityConsciousness: number;
}

export function useAgriculturalDocumentation({
  seasonalContext,
  communityConsciousness
}: UseAgriculturalDocumentationProps) {
  const [documentSystem] = useState(() => 
    new LivingDocumentationSystem(seasonalContext, communityConsciousness)
  );

  const [activeDocuments, setActiveDocuments] = useState<LivingDocument[]>([]);
  const [documentHistory, setDocumentHistory] = useState<Map<string, DocumentRevision[]>>(new Map());

  // Update active documents based on seasonal changes
  useEffect(() => {
    const documents = documentSystem.getSeasonalDocuments();
    setActiveDocuments(documents);
  }, [seasonalContext.season]);

  const createDocument = useCallback(async (
    title: string,
    content: string,
    type: DocumentType,
    wisdomDepth: WisdomDepth,
    contributors: string[],
    relatedKnowledge: string[] = []
  ) => {
    const document = await documentSystem.createDocument({
      title,
      content,
      type,
      seasonalContext,
      contributors,
      wisdomDepth,
      relatedKnowledge
    });

    setActiveDocuments(documentSystem.getSeasonalDocuments());
    return document;
  }, [documentSystem, seasonalContext]);

  const evolveDocument = useCallback(async (
    documentId: string,
    newContent: string,
    contributorId: string,
    catalyst: string
  ) => {
    const revision = await documentSystem.evolveDocument(
      documentId,
      newContent,
      contributorId,
      catalyst
    );

    if (revision) {
      setActiveDocuments(documentSystem.getSeasonalDocuments());
      const history = documentSystem.getDocumentHistory(documentId);
      setDocumentHistory(prev => new Map(prev).set(documentId, history));
    }

    return revision;
  }, [documentSystem]);

  const integrateKnowledge = useCallback(async (
    documentId: string,
    knowledge: AgriculturalKnowledge,
    contribution: CommunityContribution
  ) => {
    const success = await documentSystem.integrateKnowledge(
      documentId,
      knowledge,
      contribution
    );

    if (success) {
      setActiveDocuments(documentSystem.getSeasonalDocuments());
    }

    return success;
  }, [documentSystem]);

  const getDocumentHistory = useCallback((documentId: string) => {
    return documentSystem.getDocumentHistory(documentId);
  }, [documentSystem]);

  return {
    activeDocuments,
    documentHistory,
    createDocument,
    evolveDocument,
    integrateKnowledge,
    getDocumentHistory
  };
}