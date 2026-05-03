import { Skeleton } from './ui/skeleton';
import styles from '@/styles/quiz/quizPlayerFull.module.css';

export default function QuizSkeleton() {
  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.quizPage} style={{ gap: '2rem' }}>
        <Skeleton className={styles.pageHeader} style={{ height: '40px', width: '100%' }} />
        <Skeleton className={styles.mainProgressBar} style={{ height: '10px' }} />
        <div className={styles.questionCard} style={{ padding: '3rem' }}>
          <Skeleton style={{ height: '30px', width: '80%', marginBottom: '2rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton style={{ height: '60px', width: '100%', borderRadius: '20px' }} />
            <Skeleton style={{ height: '60px', width: '100%', borderRadius: '20px' }} />
            <Skeleton style={{ height: '60px', width: '100%', borderRadius: '20px' }} />
            <Skeleton style={{ height: '60px', width: '100%', borderRadius: '20px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
