"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function RemoveUsersModal({ onClose, onConfirm, selectedCount }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Users from Group</DialogTitle>
          <DialogDescription>
            {selectedCount === 1 
              ? "Are you sure you want to remove this user from the group?"
              : `Are you sure you want to remove these ${selectedCount} users from the group?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Remove Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}