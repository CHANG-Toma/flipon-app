export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmHandler = (options: ConfirmDialogOptions) => Promise<boolean>;

let handler: ConfirmHandler | null = null;

// Permet de définir la fonction de confirmation
export function registerConfirmDialog(next: ConfirmHandler | null) {
  handler = next;
}

// Permet de confirmer une action
export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  if (!handler) {
    return Promise.resolve(false);
  }
  return handler(options);
}
