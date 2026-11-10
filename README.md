# job-tracker

## API

All endpoints are under `/api`, and request and response bodies are JSON. Logging in or registering sets an httpOnly cookie named `token`. Endpoints that require login read that cookie and reply `401` without it.

Errors always look like `{ "message": "..." }`.

### Auth

| Method | Path | Login required | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | No | Creates an account from `{ name, email, password }` (password at least 8 characters) and logs it in. Replies `201` with `{ id, name, email }`, or `409` if the email is taken. |
| POST | `/api/auth/login` | No | Logs in with `{ email, password }`. Replies `200` with `{ id, name, email }`, or `401` for a wrong email or password. |
| POST | `/api/auth/logout` | No | Clears the login cookie. Replies `204`. |
| GET | `/api/auth/me` | Yes | Returns the logged-in user as `{ id, name, email }`. |

### Applications

Every application belongs to the logged-in user. You can never see or change another user's applications; asking for one by id gives `404`, as if it did not exist.

| Method | Path | Login required | What it does |
|---|---|---|---|
| GET | `/api/applications` | Yes | Lists your applications. Accepts the query parameters below. |
| POST | `/api/applications` | Yes | Creates an application and puts it at the bottom of its status column. Replies `201` with the saved application. |
| GET | `/api/applications/:id` | Yes | Returns one application. |
| PATCH | `/api/applications/:id` | Yes | Updates any of the fields you send. If `status` changes, the card moves to the bottom of the new column. |
| DELETE | `/api/applications/:id` | Yes | Deletes an application. Replies `204`. |
| PATCH | `/api/applications/:id/move` | Yes | Drag and drop on the board: `{ "status": "interview", "position": 2 }` puts the card in that column at that index (counting from 0) and renumbers the other cards in both columns. A position past the end puts the card last. |

An `:id` that is not a valid id gets `400`. A body that fails validation gets `400` with a message saying what is wrong.

#### Query parameters for `GET /api/applications`

| Parameter | Values | What it does |
|---|---|---|
| `status` | `wishlist`, `applied`, `interview`, `offer`, `rejected` | Only returns applications with this status. |
| `q` | text, up to 100 characters | Searches company and role, ignoring upper and lower case. |
| `sort` | `board` (default), `newest`, `oldest`, `company` | `board` sorts by status, then position on the board. `newest` and `oldest` sort by creation date. `company` sorts by company name. |

Example: `GET /api/applications?status=applied&q=frontend&sort=newest`

#### Application fields

| Field | Type | Notes |
|---|---|---|
| `company` | string | Required, 1–100 characters |
| `role` | string | Required, 1–100 characters |
| `url` | string | Optional, must be a valid URL or empty |
| `location` | string | Optional |
| `salary` | number | Optional, whole number, 0 or more |
| `status` | string | Optional, one of the statuses above, defaults to `wishlist` |
| `notes` | string | Optional, up to 2000 characters |
| `appliedAt` | date | Optional, e.g. `"2026-11-01"` |

The server also sets `_id`, `position`, `createdAt`, and `updatedAt`. You cannot set the owner or position through create or update.

### Other

| Method | Path | Login required | What it does |
|---|---|---|---|
| GET | `/api/health` | No | Replies `{ "ok": true }` if the server is running. |
