import "./Toast.css";

/** A short notice pinned to the bottom of the screen. Renders nothing while `message` is empty. */
export function Toast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="gl-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
