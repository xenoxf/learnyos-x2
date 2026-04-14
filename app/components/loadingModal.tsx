import styles from "@/styles/loadingModal.module.css";

const LoadingModal = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.loader} />
      </div>
    </div>
  );
};

export default LoadingModal;
