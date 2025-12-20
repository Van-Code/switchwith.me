import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu"

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
  ChevronRight: (props: any) => <svg data-testid="chevron-right-icon" {...props} />,
  Circle: (props: any) => <svg data-testid="circle-icon" {...props} />,
}))
let user: ReturnType<typeof userEvent.setup>

beforeEach(() => {
  user = userEvent.setup()
})

describe("DropdownMenu Components", () => {
  describe("DropdownMenu Root", () => {
    it("renders dropdown container", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const root = await screen.findByRole("menu")
      expect(root).toBeInTheDocument()
    })

    it("is closed by default", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("supports defaultOpen", () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByRole("menu")).toBeInTheDocument()
    })
  })

  describe("DropdownMenuTrigger", () => {
    it("renders trigger button", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        </DropdownMenu>
      )
      expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument()
      expect(screen.getByText("Open Menu")).toBeInTheDocument()
    })

    it("toggles menu on click", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent></DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("has aria-expanded attribute", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByTestId("dropdown-trigger")).toHaveAttribute("aria-expanded")
    })
  })

  describe("DropdownMenuContent", () => {
    it("renders menu content when open", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByTestId("dropdown-content")).toBeInTheDocument()
      expect(screen.getByText("Menu Content")).toBeInTheDocument()
    })

    it("applies content styles", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const content = screen.getByRole("menu")
      expect(content).toHaveClass("z-50", "min-w-[8rem]", "rounded-md", "border")
    })

    it("applies custom className", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content"></DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const content = await screen.findByTestId("dropdown-content")
      expect(content).toHaveClass("custom-content")
    })
  })

  describe("DropdownMenuItem", () => {
    it("renders menu item", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByRole("menuitem")).toBeInTheDocument()
      expect(screen.getByText("Profile")).toBeInTheDocument()
    })

    it("calls onSelect when clicked", async () => {
      const handleSelect = jest.fn()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      await user.click(screen.getByText("Settings"))
      expect(handleSelect).toHaveBeenCalledTimes(1)
    })

    it("handles disabled state", async () => {
      const handleSelect = jest.fn()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled={true} onSelect={handleSelect}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const item = screen.getByRole("menuitem")
      expect(item).toHaveAttribute("data-disabled", "true")

      await user.click(item)
      expect(handleSelect).not.toHaveBeenCalled()
    })

    it("supports inset prop", async () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const item = screen.getByText("Inset Item")
      expect(item).toHaveClass("pl-8")
    })
  })

  describe("DropdownMenuCheckboxItem", () => {
    it("renders checkbox item", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Show Toolbar</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByTestId("dropdown-content")).toBeInTheDocument()
      expect(screen.getByText("Show Toolbar")).toBeVisible()
    })

    it("toggles checked state", async () => {
      const handleCheckedChange = jest.fn()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={handleCheckedChange}
            >
              Option
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      await user.click(screen.getByText("Option"))
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it("displays checked state", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>Checked</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      const item = screen.getByRole("menuitemcheckbox")
      expect(item).toHaveAttribute("aria-checked", "true")
    })

    it("renders check icon when checked", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={true}>Checked</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByTestId("check-icon")).toBeInTheDocument()
    })
  })

  describe("DropdownMenuRadioGroup & DropdownMenuRadioItem", () => {
    it("renders radio group with items", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByRole("group")).toBeInTheDocument()
      expect(screen.getAllByRole("menuitemradio")).toHaveLength(2)
    })

    it("handles radio selection", async () => {
      const handleValueChange = jest.fn()

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      await user.click(screen.getByText("Option 2"))
      expect(handleValueChange).toHaveBeenCalledWith("option2")
    })

    it("renders circle indicator for radio items", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument()
    })
  })

  describe("DropdownMenuLabel", () => {
    it("renders menu label", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByText("My Account")).toBeInTheDocument()
    })

    it("applies label styles", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      const label = screen.getByText("Label")
      expect(label).toHaveClass("px-2", "py-1.5", "text-sm", "font-semibold")
    })

    it("supports inset prop", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByText("Inset Label")).toHaveClass("pl-8")
    })
  })

  describe("DropdownMenuSeparator", () => {
    it("renders separator", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByTestId("dropdown-separator")).toBeInTheDocument()
    })

    it("applies separator styles", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      const separator = screen.getByTestId("dropdown-separator")
      expect(separator).toHaveClass("-mx-1", "my-1", "h-px", "bg-muted")
    })
  })

  describe("DropdownMenuShortcut", () => {
    it("renders keyboard shortcut", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      expect(screen.getByText("⌘S")).toBeInTheDocument()
    })

    it("applies shortcut styles", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))

      const shortcut = screen.getByText("⌘C")
      expect(shortcut).toHaveClass("ml-auto", "text-xs", "opacity-60")
    })
  })

  describe("DropdownMenuSub", () => {
    it("renders submenu trigger", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByTestId("dropdown-sub-trigger")).toBeInTheDocument()

      await user.click(screen.getByTestId("dropdown-sub-trigger"))
      expect(screen.getByText("More Options")).toBeInTheDocument()
    })

    it("renders chevron icon on submenu trigger", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByTestId("dropdown-sub-trigger")).toBeInTheDocument()

      await user.click(screen.getByTestId("dropdown-sub-trigger"))
      expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument()
    })

    it("toggles submenu content", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Submenu Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      expect(screen.queryByText("Submenu Item")).not.toBeInTheDocument()
      const trigger = await screen.findByTestId("dropdown-trigger")
      await user.click(trigger)
      const subtrigger = await screen.findByTestId("dropdown-sub-trigger")
      await user.click(subtrigger)
      expect(screen.getByText("Submenu Item")).toBeInTheDocument()
    })
  })

  describe("Complete DropdownMenu", () => {
    it("renders complete dropdown with all components", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={true}>
              Show Toolbar
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="dark">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      const trigger = await screen.findByTestId("dropdown-trigger")
      await user.click(trigger)

      expect(screen.getByText("My Account")).toBeInTheDocument()
      expect(screen.getByText("Profile")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
      expect(screen.getByText("Show Toolbar")).toBeInTheDocument()
      expect(screen.getByText("Light")).toBeInTheDocument()
      expect(screen.getByText("Dark")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("menu has correct role", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("menu items are keyboard accessible", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const item = screen.getByRole("menuitem")
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute("tabIndex", "-1")
    })

    it("disabled items are not focusable", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      await user.click(screen.getByTestId("dropdown-trigger"))
      const item = screen.getByRole("menu")
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute("tabIndex", "-1")
    })
  })
})
