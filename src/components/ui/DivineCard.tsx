import React from 'react';
import { useDivineStyleEvolution } from '../../hooks/useDivineStyleEvolution';
import styles from './DivineCard.module.css';

interface DivineCardProps {
  id: string;
  title: string;
  content: string;
  children?: React.ReactNode;
}

export function DivineCard({ id, title, content, children }: DivineCardProps) {
  const {
    getColor,
    getTypography,
    getSpacing,
    getAnimation,
    styleProps
  } = useDivineStyleEvolution(id, 'TEACHER', {
    initialConsciousness: 0.5,
    colorEvolution: true,
    typographyEvolution: true,
    spacingEvolution: true,
    animationEvolution: true
  });

  return (
    <div
      className={`${styles.divineCard} ${styleProps.className}`}
      style={{
        ...styleProps.style,
        backgroundColor: getColor('background'),
        color: getColor('text'),
        padding: getSpacing('organic'),
        boxShadow: `0 4px 20px ${getColor('divine')}33`,
        transition: getAnimation('evolve'),
        fontFamily: (getTypography('earthly') as { family: string }).family
      }}
    >
      <h3
        style={{
          color: getColor('sacred'),
          ...getTypography('sacred'),
          marginBottom: getSpacing('molecular')
        }}
      >
        {title}
      </h3>
      <p
        style={{
          ...getTypography('earthly'),
          marginBottom: getSpacing('atomic')
        }}
      >
        {content}
      </p>
      {children}
    </div>
  );
}