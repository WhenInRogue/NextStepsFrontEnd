import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/alert-dialog";

const RetakeAssessmentDialog = ({
  testId,
  testName,
  trigger,
}: {
  testId: number;
  testName?: string;
  trigger: ReactElement;
}) => {
  const navigate = useNavigate();
  const name = testName?.trim() || "this assessment";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">Retake {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to retake this assessment? This starts a new attempt from the beginning.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate(`/take/${testId}`)}>Retake</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RetakeAssessmentDialog;
