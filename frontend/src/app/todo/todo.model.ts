/** A single TODO item, as returned by the API. */
export interface Todo {
  id: string;
  title: string;
  /** ISO-8601 timestamp of when the item was created. */
  createdAt: string;
}
