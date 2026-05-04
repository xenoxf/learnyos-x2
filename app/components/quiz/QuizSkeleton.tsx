
import styles from '@/styles/quiz/quizPlayerFull.module.css';
import { cn } from "@/lib/utils";

export default function QuizSkeleton() {
  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.quizPage} style={{ gap: '2rem' }}>
        {/* Header Skeleton */}
        <div 
          className={cn(styles.pageHeader, "skeleton")} 
          style={{ 
            height: '70px', 
            width: '100%', 
            borderRadius: '12px',
            border: 'none'
          }} 
        />
        
        {/* Progress Bar Skeleton */}
        <div 
          className={cn(styles.progressBar, "skeleton")} 
          style={{ 
            height: '8px', 
            width: '100%', 
            borderRadius: '4px',
            marginTop: '-1rem'
          }} 
        />
        
        {/* Question Card Skeleton */}
        <div 
          className={styles.questionCard} 
          style={{ 
            padding: '2.5rem', 
            border: 'none', 
            background: 'hsl(var(--card) / 0.5)',
            boxShadow: 'none'
          }}
        >
          {/* Question Title */}
          <div 
            className="skeleton" 
            style={{ 
              height: '32px', 
              width: '85%', 
              marginBottom: '1.2rem', 
              borderRadius: '8px' 
            }} 
          />
          
          {/* Question Description/Subtitle */}
          <div 
            className="skeleton" 
            style={{ 
              height: '20px', 
              width: '60%', 
              marginBottom: '3rem', 
              borderRadius: '8px' 
            }} 
          />
          
          {/* Options Skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="skeleton" style={{ height: '68px', width: '100%', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '68px', width: '100%', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '68px', width: '100%', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '68px', width: '100%', borderRadius: '16px' }} />
          </div>
        </div>

        {/* Footer Actions Skeleton */}
        <div 
          className={styles.pageFooter} 
          style={{ 
            border: 'none', 
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between', 
            marginTop: 'auto',
            paddingTop: '2rem'
          }}
        >
           <div className="skeleton" style={{ height: '52px', width: '140px', borderRadius: '12px' }} />
           <div className="skeleton" style={{ height: '52px', width: '180px', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  );
}
