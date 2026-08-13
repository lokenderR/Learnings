# State Machine DP

State Machine DP is useful when the process moves between a small number of meaningful states after each decision.

## Recognition Signals

- You repeatedly choose between actions such as buy, sell, hold, rest, take, skip, open, or close.
- Some actions are legal only from certain states.
- The best future depends on the current state, not the full history.

## Mental Model

Name each state by what must be true after processing the current item.

For stock problems, common states are:

- `cash`: not holding stock after this day
- `hold`: holding stock after this day

## Representative Problems

- [Stock With Transaction Fee](stock-with-transaction-fee.md)

## Related Patterns

- Dynamic Programming
- Greedy, when a local exchange argument can replace state tracking
