import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";

interface AlertDialogDestructiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName?: string;
  onConfirm?: () => void;
}

export function AlertDialogDestructive({
  open,
  onOpenChange,
  memberName,
  onConfirm,
}: AlertDialogDestructiveProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Remover sócio?</AlertDialogTitle>
          <AlertDialogDescription>
            {memberName ? (
              <>
                Esta ação vai remover definitivamente o sócio{" "}
                <span className="font-semibold text-foreground">{memberName}</span>.
              </>
            ) : (
              "Esta ação vai remover definitivamente este sócio."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
