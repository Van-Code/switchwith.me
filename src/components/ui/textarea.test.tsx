import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { Textarea } from "./textarea"

describe("Textarea", () => {
  describe("Rendering", () => {
    it("renders textarea element", () => {
      render(<Textarea placeholder="Enter description" />)
      expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument()
    })

    it("forwards ref correctly", () => {
      const ref = jest.fn()
      render(<Textarea ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe("Styling", () => {
    it("applies base textarea styles", () => {
      const { container } = render(<Textarea />)
      const textarea = container.querySelector("textarea")
      expect(textarea).toHaveClass(
        "flex",
        "min-h-[80px]",
        "w-full",
        "rounded-md",
        "border"
      )
    })

    it("applies custom className", () => {
      const { container } = render(<Textarea className="custom-textarea" />)
      const textarea = container.querySelector("textarea")
      expect(textarea).toHaveClass("custom-textarea")
    })

    it("merges custom className with default classes", () => {
      const { container } = render(<Textarea className="h-40" />)
      const textarea = container.querySelector("textarea")
      expect(textarea).toHaveClass("min-h-[80px]", "h-40")
    })
  })

  describe("Props & Attributes", () => {
    it("accepts placeholder text", () => {
      render(<Textarea placeholder="Write something..." />)
      expect(screen.getByPlaceholderText("Write something...")).toBeInTheDocument()
    })

    it("handles disabled state", () => {
      render(<Textarea disabled data-testid="disabled-textarea" />)
      const textarea = screen.getByTestId("disabled-textarea")
      expect(textarea).toBeDisabled()
    })

    it("handles readonly state", () => {
      render(<Textarea readOnly value="Read only content" data-testid="readonly" />)
      const textarea = screen.getByTestId("readonly")
      expect(textarea).toHaveAttribute("readonly")
    })

    it("accepts required attribute", () => {
      render(<Textarea required data-testid="required-textarea" />)
      expect(screen.getByTestId("required-textarea")).toBeRequired()
    })

    it("accepts rows attribute", () => {
      render(<Textarea rows={5} data-testid="textarea" />)
      expect(screen.getByTestId("textarea")).toHaveAttribute("rows", "5")
    })

    it("accepts maxLength attribute", () => {
      render(<Textarea maxLength={100} data-testid="textarea" />)
      expect(screen.getByTestId("textarea")).toHaveAttribute("maxLength", "100")
    })

    it("accepts name attribute", () => {
      render(<Textarea name="description" data-testid="textarea" />)
      expect(screen.getByTestId("textarea")).toHaveAttribute("name", "description")
    })
  })

  describe("User Interactions", () => {
    it("accepts user input", async () => {
      const user = userEvent.setup()
      render(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId("textarea")

      await user.type(textarea, "Multi-line\ntext input")
      expect(textarea).toHaveValue("Multi-line\ntext input")
    })

    it("calls onChange handler when value changes", async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} data-testid="textarea" />)

      await user.type(screen.getByTestId("textarea"), "Test")
      expect(handleChange).toHaveBeenCalled()
    })

    it("calls onFocus handler when focused", async () => {
      const user = userEvent.setup()
      const handleFocus = jest.fn()
      render(<Textarea onFocus={handleFocus} data-testid="textarea" />)

      await user.click(screen.getByTestId("textarea"))
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it("calls onBlur handler when blurred", async () => {
      const user = userEvent.setup()
      const handleBlur = jest.fn()
      render(<Textarea onBlur={handleBlur} data-testid="textarea" />)

      const textarea = screen.getByTestId("textarea")
      await user.click(textarea)
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it("can be cleared", async () => {
      const user = userEvent.setup()
      render(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId("textarea") as HTMLTextAreaElement

      await user.type(textarea, "Test content")
      expect(textarea.value).toBe("Test content")

      await user.clear(textarea)
      expect(textarea.value).toBe("")
    })

    it("supports multi-line input", async () => {
      const user = userEvent.setup()
      render(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId("textarea")

      await user.type(textarea, "Line 1{Enter}Line 2{Enter}Line 3")
      expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3")
    })

    it("respects maxLength attribute", async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={10} data-testid="textarea" />)
      const textarea = screen.getByTestId("textarea")

      await user.type(textarea, "This is a very long text")
      expect(textarea).toHaveValue("This is a ")
    })
  })

  describe("Controlled Component", () => {
    it("works as controlled component", async () => {
      const user = userEvent.setup()
      const ControlledTextarea = () => {
        const [value, setValue] = React.useState("")
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-textarea"
          />
        )
      }

      render(<ControlledTextarea />)
      const textarea = screen.getByTestId("controlled-textarea")

      await user.type(textarea, "Controlled text")
      expect(textarea).toHaveValue("Controlled text")
    })

    it("handles value updates from parent", () => {
      const { rerender } = render(<Textarea value="Initial" data-testid="textarea" />)
      expect(screen.getByTestId("textarea")).toHaveValue("Initial")

      rerender(<Textarea value="Updated" data-testid="textarea" />)
      expect(screen.getByTestId("textarea")).toHaveValue("Updated")
    })
  })
})
