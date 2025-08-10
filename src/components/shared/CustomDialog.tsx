import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React, { Dispatch, SetStateAction } from "react"
function CustomDialog({ icon,
  title="",
  description="",
  open,
  setOpen,
  children
}: {
  icon: React.ReactNode,
  title?: string,
  description?:string,
  open:boolean,
  setOpen:Dispatch<SetStateAction<boolean>>
  children:React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(setOpen)}>
      <DialogTrigger>{icon}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {
              description
            }
          </DialogDescription>
        </DialogHeader>
          {children}
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialog