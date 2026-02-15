import styles from "@/styles/loadingModal.module.css";
import { Loader } from "lucide-react";

const LoadingModal = () => {
  return (
    <div className={styles.container}>
      <Loader className={styles.loader} />
    </div>
  );
};

export default LoadingModal;
