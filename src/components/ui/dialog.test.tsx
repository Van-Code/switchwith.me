import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"

import React from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "./dialog"

// Mock lucide-react
jest.mock("lucide-react", () => ({
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}))

describe("Dialog Components", () => {
  describe("Dialog Root", () => {
    it("renders dialog container", () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>
      )

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument()
    })

    it("is closed by default", () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("supports defaultOpen prop", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Default Open Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Default Open Content")).toBeInTheDocument()
    })

    it("supports controlled mode", () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

      rerender(
        <Dialog open={true}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
  })

  describe("DialogTrigger", () => {
    it("renders trigger button", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>
      )

      expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument()
      expect(screen.getByText("Open Dialog")).toBeInTheDocument()
    })

    it("opens dialog on click", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Dialog Content</DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

      await user.click(screen.getByTestId("dialog-trigger"))
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Dialog Content")).toBeInTheDocument()
    })

    it("calls onOpenChange callback", async () => {
      const user = userEvent.setup()
      const handleOpenChange = jest.fn()

      render(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      await user.click(screen.getByTestId("dialog-trigger"))
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe("DialogContent", () => {
    it("renders dialog content when open", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Dialog Content Here</DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Dialog Content Here")).toBeInTheDocument()
    })

    it("does not render when closed", () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Hidden Content</DialogContent>
        </Dialog>
      )

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("applies content styles", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      const content = screen.getByRole("dialog")
      expect(content).toHaveClass(
        "fixed",
        "left-[50%]",
        "top-[50%]",
        "z-50",
        "grid",
        "w-full"
      )
    })

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent className="custom-dialog">Content</DialogContent>
        </Dialog>
      )

      const content = screen.getByRole("dialog")
      expect(content).toHaveClass("custom-dialog")
    })

    it("renders close button with X icon", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId("x-icon")).toBeInTheDocument()
      expect(screen.getByText("Close")).toBeInTheDocument()
    })

    it("has correct aria attributes", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole("dialog")
      expect(dialog).toHaveAttribute("aria-modal", "true")
    })

    it("forwards ref correctly", () => {
      const ref = jest.fn()
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent ref={ref}>Content</DialogContent>
        </Dialog>
      )

      expect(ref).toBeTruthy()
    })
  })

  describe("DialogOverlay", () => {
    it("renders overlay when dialog is open", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId("dialog-overlay")).toBeInTheDocument()
    })

    it("applies overlay styles", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      const overlay = screen.getByTestId("dialog-overlay")
      expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-black/80")
    })
  })

  describe("DialogHeader", () => {
    it("renders dialog header", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">Header Content</DialogHeader>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId("dialog-header")).toBeInTheDocument()
      expect(screen.getByText("Header Content")).toBeInTheDocument()
    })

    it("applies header styles", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="header">Header</DialogHeader>
          </DialogContent>
        </Dialog>
      )

      const header = screen.getByTestId("header")
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5")
    })

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="header">
              Header
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId("header")).toHaveClass("custom-header")
    })
  })

  describe("DialogTitle", () => {
    it("renders dialog title", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText("Dialog Title")).toBeInTheDocument()
    })

    it("renders as h2 element", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument()
    })

    it("applies title styles", () => {
      const { container } = render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const title = container.querySelector("h2")
      expect(title).toHaveClass("text-lg", "font-semibold", "leading-none")
    })

    it("forwards ref correctly", () => {
      const ref = jest.fn()
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle ref={ref}>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(ref).toBeTruthy()
    })
  })

  describe("DialogDescription", () => {
    it("renders dialog description", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText("This is a description")).toBeInTheDocument()
    })

    it("renders as p element", () => {
      const { container } = render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const description = container.querySelector("p")
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent("Description")
    })

    it("applies description styles", () => {
      const { container } = render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const description = container.querySelector("p")
      expect(description).toHaveClass("text-sm", "text-muted-foreground")
    })

    it("forwards ref correctly", () => {
      const ref = jest.fn()
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogDescription ref={ref}>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(ref).toBeTruthy()
    })
  })

  describe("DialogFooter", () => {
    it("renders dialog footer", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogFooter data-testid="dialog-footer">Footer Content</DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId("dialog-footer")).toBeInTheDocument()
      expect(screen.getByText("Footer Content")).toBeInTheDocument()
    })

    it("applies footer styles", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogFooter data-testid="footer">Footer</DialogFooter>
          </DialogContent>
        </Dialog>
      )

      const footer = screen.getByTestId("footer")
      expect(footer).toHaveClass("flex", "flex-col-reverse")
    })
  })

  describe("DialogClose", () => {
    it("closes dialog on click", async () => {
      const user = userEvent.setup()

      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogClose>Close Dialog</DialogClose>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()

      await user.click(screen.getByTestId("dialog-close"))
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("calls onOpenChange with false", async () => {
      const user = userEvent.setup()
      const handleOpenChange = jest.fn()

      render(
        <Dialog defaultOpen onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByTestId("dialog-close"))
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("Complete Dialog", () => {
    it("renders complete dialog with all components", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure you want to continue?</DialogDescription>
            </DialogHeader>
            <div>Dialog Body Content</div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText("Confirm Action")).toBeInTheDocument()
      expect(screen.getByText("Are you sure you want to continue?")).toBeInTheDocument()
      expect(screen.getByText("Dialog Body Content")).toBeInTheDocument()
      expect(screen.getByText("Cancel")).toBeInTheDocument()
      expect(screen.getByText("Confirm")).toBeInTheDocument()
    })

    it("opens and closes dialog workflow", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      )

      // Initially closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

      // Open dialog
      await user.click(screen.getByText("Open Dialog"))
      expect(screen.getByRole("dialog")).toBeInTheDocument()

      // Close dialog
      await user.click(screen.getByTestId("dialog-close"))
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it('has role="dialog"', () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it('has role="dialog"', () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      expect(screen.getByRole("dialog")).toHaveAttribute("role", "dialog")
    })

    it("close button has sr-only text", () => {
      render(
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      const closeText = screen.getByText("Close")
      expect(closeText).toHaveClass("sr-only")
    })
  })
})
