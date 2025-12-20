import { render, screen } from "@testing-library/react"
import { Label } from "./label"

describe("Label", () => {
  describe("Rendering", () => {
    it("renders label with children", () => {
      render(<Label>Username</Label>)
      expect(screen.getByText("Username")).toBeInTheDocument()
    })

    it("renders as label element", () => {
      render(<Label>Email</Label>)
      expect(screen.getByText("Email").tagName).toBe("LABEL")
    })

    it("forwards ref correctly", () => {
      const ref = jest.fn()
      render(<Label ref={ref}>Label</Label>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe("Props & Attributes", () => {
    it("applies custom className", () => {
      render(<Label className="custom-label">Custom</Label>)
      const label = screen.getByText("Custom")
      expect(label).toHaveClass("custom-label")
    })

    it("applies base label styles", () => {
      render(<Label>Styled Label</Label>)
      const label = screen.getByText("Styled Label")
      expect(label).toHaveClass("text-sm", "font-medium", "leading-none")
    })

    it("supports htmlFor attribute", () => {
      render(<Label htmlFor="input-id">Email</Label>)
      const label = screen.getByText("Email")
      expect(label).toHaveAttribute("for", "input-id")
    })

    it("passes through HTML attributes", () => {
      render(<Label data-testid="test-label">Test</Label>)
      expect(screen.getByTestId("test-label")).toBeInTheDocument()
    })
  })

  describe("Integration with Form Elements", () => {
    it("associates with input via htmlFor", () => {
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </>
      )

      const label = screen.getByText("Username")
      const input = screen.getByRole("textbox")
      expect(label).toHaveAttribute("for", "username")
      expect(input).toHaveAttribute("id", "username")
    })

    it("can wrap form control", () => {
      render(
        <Label>
          Email
          <input type="email" />
        </Label>
      )

      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByRole("textbox")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("supports required fields", () => {
      render(
        <>
          <Label htmlFor="required-field">
            Required Field
            <span aria-hidden="true"> *</span>
          </Label>
          <input id="required-field" required />
        </>
      )

      expect(screen.getByText(/required field/i)).toBeInTheDocument()
    })
  })
})
