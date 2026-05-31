import styles from './ErrorMessage.module.css';

type ErrorMessageProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className={styles.container}>
      <p className={styles.message}>
        {message ?? 'Something went wrong. Please try again.'}
      </p>
      <button type="button" onClick={onRetry} className={styles.retryButton}>
        Retry
      </button>
    </div>
  );
}
