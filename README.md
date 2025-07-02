# Online Casino Slot Machine

A full-stack slot machine game with session-based credit tracking and controlled win logic to favor the house.

## Stack

- **Frontend**: React, TypeScript, Vite, Vitest, Testing Library
- **Backend**: NestJS (Express), Supertest
- **Monorepo structure**: `apps/client`, `apps/server`

## Getting Started

```bash
# Install dependencies
pnpm install

# Run frontend
pnpm --filter client dev

# Run backend
pnpm --filter server start

# Run tests
pnpm --filter server test:e2e
pnpm --filter client test
```

## Logic

- A new session starts with 10 credits.
- Each roll costs 1 credit.
- Win condition: three identical symbols —  
  Cherry (10), Lemon (20), Orange (30), Watermelon (40)
- Server behavior:
  - **< 40 credits**: rolls are fair
  - **40–60 credits**: 30% chance to re-roll a winning result
  - **> 60 credits**: 60% chance to re-roll a winning result
- Cashing out ends the session and returns current credits

## UI Behavior

- 3-slot display with spin animation and staggered reveal (1s, 2s, 3s)
- Disabled Spin button during animation or when credits are 0
- Displays error, no credits, and session-closed messages

## Testing

### Backend

End-to-end tests cover:

- Session creation
- Roll logic and rewards
- Cash out flow
- Error scenarios (no session, 0 credits)
- House logic at different credit levels

### Frontend

Unit tests cover:

- Rendering and Spin button state
- Error and status messages
- Roll animation and credit updates
- Roll API call mocking

## Development Timeline

### Initialized the monorepo
- Set up the project with `pnpm`, `NestJS` for the backend, and `Vite + React` for the frontend.
- Configured shared types and basic structure.

### Implemented the session controller
- Built the session creation logic with cookies using Express in NestJS.
- Added validation and error handling for invalid or missing session cookies.

### Added roll functionality
- Developed core slot roll logic with randomized symbols and conditional re-rolls based on credit level.
- Challenges:
    - Implementing "house always wins" mechanic required balancing between randomness and fairness.
    - Ensuring predictable behavior for test cases while maintaining random feel in production.

### Implemented Slot Machine on FE
- Created basic UI layout with 3-symbol display, roll animation delays, and state handling.
- Implemented staggered spin effects with `setTimeout` while syncing with backend result.

### Implemented cashout functionality
- Backend invalidates session and returns final credits.
- Frontend disables further rolls and shows a session-closed message.

### Wrote E2E tests for the backend
- Used `supertest` with `jest` to verify session flow: create → roll → cashout.
- Challenges:
    - Handling cookie persistence correctly between requests.
    - Mocking credit logic flow to test house edge scenarios.

### Wrote unit tests for frontend
- Tested rendering logic, button states, error and edge cases.
- Mocked API to simulate real responses and delays.
- Challenges:
    - Had to properly mock `setTimeout` with `vi.useFakeTimers()` to test delayed UI updates.
    - Verified UI messages, states, and correct credit logic updates.

