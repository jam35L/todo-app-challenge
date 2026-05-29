/** A single TODO item, as returned by the API. */
export interface Todo {
  id: string;
  title: string;
  /** Optional free-text notes; `null` when none was given. */
  description: string | null;
  /** ISO-8601 UTC timestamp of when the item was created. */
  createdAtUtc: string;
}
