enum CircuitState {
  CLOSED,  // Normal operation
  OPEN,    // Failing, reject fast
  HALF_OPEN // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

class CircuitBreaker {
  private static instance: CircuitBreaker;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls: number = 0;

  private config: CircuitBreakerConfig = {
    failureThreshold: 5,    // Number of failures before opening
    resetTimeout: 30000,    // 30 seconds
    halfOpenMaxCalls: 3     // Max calls in half-open state
  };

  private constructor() {}

  static getInstance(): CircuitBreaker {
    if (!CircuitBreaker.instance) {
      CircuitBreaker.instance = new CircuitBreaker();
    }
    return CircuitBreaker.instance;
  }

  private shouldReset(): boolean {
    return (
      this.state === CircuitState.OPEN &&
      Date.now() - this.lastFailureTime > this.config.resetTimeout
    );
  }

  async execute<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldReset()) {
        console.log('🔌 [CIRCUIT] Transitioning to HALF_OPEN state');
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
      } else {
        console.log('🔌 [CIRCUIT] Circuit OPEN, using fallback');
        return fallback();
      }
    }

    if (
      this.state === CircuitState.HALF_OPEN &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      console.log('🔌 [CIRCUIT] Too many calls in HALF_OPEN state');
      return fallback();
    }

    try {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCalls++;
      }

      const result = await operation();

      // Success, reset circuit if needed
      if (this.state !== CircuitState.CLOSED) {
        console.log('🔌 [CIRCUIT] Success, resetting to CLOSED state');
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.halfOpenCalls = 0;
      }

      return result;
    } catch (error) {
      this.lastFailureTime = Date.now();
      this.failures++;

      if (
        this.state === CircuitState.CLOSED &&
        this.failures >= this.config.failureThreshold
      ) {
        console.log('🔌 [CIRCUIT] Too many failures, opening circuit');
        this.state = CircuitState.OPEN;
      }

      if (this.state === CircuitState.HALF_OPEN) {
        console.log('🔌 [CIRCUIT] Failure in HALF_OPEN state, opening circuit');
        this.state = CircuitState.OPEN;
      }

      console.error('🔌 [CIRCUIT] Operation failed:', error);
      return fallback();
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.lastFailureTime = 0;
    this.halfOpenCalls = 0;
  }
}

export const circuitBreaker = CircuitBreaker.getInstance();
