import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const routeToPageMap: Record<string, number> = {
  "/register": 4,
  "/dashboard": 6,
  "/equipment": 7,
  "/checkOutEquipment": 8,
  "/checkOutSupply": 9,
  "/checkInEquipment": 10,
  "/checkInSupply": 11,
  "/supply": 12,
  "/supplyTransactions": 13,
  "/equipmentTransactions": 14,
  "/maintenanceRecords": 15,
  "/profile": 16,
};

const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  const getPdfPage = () => {
    return routeToPageMap[location.pathname] || 1;
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        aria-label="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 py-2 border-b shrink-0">
            <DialogTitle className="text-base">User Manual</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              src={`/User_Manual.pdf#page=${getPdfPage()}`}
              className="w-full h-full"
              title="User Manual"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpButton;
