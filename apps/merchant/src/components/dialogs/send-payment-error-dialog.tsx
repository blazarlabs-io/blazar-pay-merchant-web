import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { Button } from "@repo/ui/components/ui/button";

export type SendPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SendPaymentErrorDialog({
  open,
  onOpenChange,
}: SendPaymentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Error Sending Payment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please make sure to select a client from your contacts before
            sending a payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="text-destructive min-w-[80px] bg-transparent border-none hover:bg-destructive/40 transition-all duration-200 ease-in-out">
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
