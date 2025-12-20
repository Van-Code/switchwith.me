import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactForm from "./contact-form"

// Mock fetch
global.fetch = jest.fn()

describe("ContactForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe("Rendering", () => {
    it("renders all form fields", () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it("renders submit button", () => {
      render(<ContactForm />)
      expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument()
    })

    it("renders honeypot field hidden", () => {
      const { container } = render(<ContactForm />)
      const honeypotField = container.querySelector("#website")
      const honeypotContainer = honeypotField?.parentElement

      expect(honeypotContainer).toHaveClass("hidden")
      expect(honeypotContainer).toHaveAttribute("aria-hidden", "true")
    })

    it("marks required fields with asterisk", () => {
      render(<ContactForm />)

      expect(screen.getByText(/name/i).parentElement).toContainHTML("*")
      expect(screen.getByText(/email/i).parentElement).toContainHTML("*")
      expect(screen.getByText(/message/i).parentElement).toContainHTML("*")
    })
  })

  describe("Form Input", () => {
    it("accepts user input in name field", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, "John Doe")

      expect(nameInput).toHaveValue("John Doe")
    })

    it("accepts user input in email field", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "john@example.com")

      expect(emailInput).toHaveValue("john@example.com")
    })

    it("accepts user input in subject field", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      const subjectInput = screen.getByLabelText(/subject/i)
      await user.type(subjectInput, "Test Subject")

      expect(subjectInput).toHaveValue("Test Subject")
    })

    it("accepts user input in message field", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, "This is a test message.")

      expect(messageInput).toHaveValue("This is a test message.")
    })
  })

  describe("Form Validation", () => {
    it("shows error when name is empty", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      const submitButton = screen.getByRole("button", { name: /send message/i })
      await user.click(submitButton)

      expect(
        await screen.findByText(/please fill in all required fields/i)
      ).toBeInTheDocument()
    })

    it("shows error when email is empty", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(
        await screen.findByText(/please fill in all required fields/i)
      ).toBeInTheDocument()
    })

    it("shows error when message is empty", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(
        await screen.findByText(/please fill in all required fields/i)
      ).toBeInTheDocument()
    })

    it("validates email format", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "invalid-email@c")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(
        await screen.findByText(/please enter a valid email address/i)
      ).toBeInTheDocument()
    })

    it("accepts valid email formats", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "valid.email@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    it("allows submission when subject is empty", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })
  })

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John Doe")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/subject/i), "Test Subject")
      await user.type(screen.getByLabelText(/message/i), "Test message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            subject: "Test Subject",
            message: "Test message",
            website: "",
          }),
        })
      })
    })

    it("includes honeypot field in submission", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/contact",
          expect.objectContaining({
            body: expect.stringContaining('"website":""'),
          })
        )
      })
    })

    it("shows loading state during submission", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/sending\.\.\./i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /sending\.\.\./i })).toBeDisabled()
    })

    it("disables form fields during submission", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeDisabled()
        expect(screen.getByLabelText(/email/i)).toBeDisabled()
        expect(screen.getByLabelText(/subject/i)).toBeDisabled()
        expect(screen.getByLabelText(/message/i)).toBeDisabled()
      })
    })

    it("shows success message on successful submission", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/thanks for reaching out/i)).toBeInTheDocument()
    })

    it("clears form after successful submission", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const messageInput = screen.getByLabelText(/message/i)

      await user.type(nameInput, "John")
      await user.type(emailInput, "john@example.com")
      await user.type(messageInput, "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      await waitFor(() => {
        expect(nameInput).toHaveValue("")
        expect(emailInput).toHaveValue("")
        expect(messageInput).toHaveValue("")
      })
    })

    it("auto-hides success message after 5 seconds", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/thanks for reaching out/i)).toBeInTheDocument()

      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(screen.queryByText(/thanks for reaching out/i)).not.toBeInTheDocument()
      })
    })
  })

  describe("Error Handling", () => {
    it("shows error message on API failure", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/server error/i)).toBeInTheDocument()
    })

    it("shows generic error on network failure", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/network error/i)).toBeInTheDocument()
    })

    it("shows fallback error for unknown errors", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockRejectedValueOnce("Unknown error")

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has proper form labels", () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it("marks required fields", () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/name/i)).toBeRequired()
      expect(screen.getByLabelText(/email/i)).toBeRequired()
      expect(screen.getByLabelText(/message/i)).toBeRequired()
    })

    it("success message has proper ARIA attributes", async () => {
      const user = userEvent.setup({ delay: null })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/name/i), "John")
      await user.type(screen.getByLabelText(/email/i), "john@example.com")
      await user.type(screen.getByLabelText(/message/i), "Message")

      await user.click(screen.getByRole("button", { name: /send message/i }))

      const alert = await screen.findByRole("alert")
      expect(alert).toHaveAttribute("aria-live", "polite")
    })

    it("error message has proper ARIA attributes", async () => {
      const user = userEvent.setup({ delay: null })
      render(<ContactForm />)

      await user.click(screen.getByRole("button", { name: /send message/i }))

      const alert = await screen.findByRole("alert")
      expect(alert).toHaveAttribute("aria-live", "polite")
    })
  })
})
