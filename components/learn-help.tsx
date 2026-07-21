"use client"

import { useState } from "react"
import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { LearnContent } from "@/components/learn-content"
import { useIsMobile } from "@/hooks/use-media-query"

export function LearnHelp() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"learn" | "privacy">("learn")

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setStep("learn")
  }

  const trigger = (
    <Button variant="ghost" size="sm">
      <CircleHelp data-icon="inline-start" />
      Learn
    </Button>
  )

  const contentProps = {
    step,
    onGotIt: () => setStep("privacy"),
    onUnderstood: () => handleOpenChange(false),
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <LearnContent
              {...contentProps}
              Header={DrawerHeader}
              Title={DrawerTitle}
              Description={DrawerDescription}
              Footer={DrawerFooter}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <LearnContent
          {...contentProps}
          Header={DialogHeader}
          Title={DialogTitle}
          Description={DialogDescription}
          Footer={DialogFooter}
        />
      </DialogContent>
    </Dialog>
  )
}
