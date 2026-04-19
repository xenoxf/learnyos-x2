import styles from '@/styles/espacio/card.module.css';
import { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';

export default function SkeletonCard() {
  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.itemCardHeader}>
            <Skeleton className={styles.skeletonTitle} />
          </div>
          <Skeleton className={styles.skeletonDescription} />
          <Skeleton className={styles.skeletonDescriptionLine} />
          <div className={styles.skeletonBadges}>
            <Skeleton className={styles.skeletonBadge} />
            <Skeleton className={styles.skeletonBadge} />
          </div>
          <div className={styles.skeletonFooter}>
            <Skeleton className={styles.skeletonCreator} />
            <Skeleton className={styles.skeletonCode} />
          </div>
        </div>
      )),
    [],
  );

  return <div className={styles.itemsList}>{skeletons}</div>;


}

