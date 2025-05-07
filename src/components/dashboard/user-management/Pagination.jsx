import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="p-4 flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        {currentPage} of {totalPages}
      </span>
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}