import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

interface SideBarInputProps {
  defaultValue?: string
  placeholder?: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

export function SideBarInput({
  defaultValue = "",
  placeholder = "Enter a value",
  onSubmit,
  onCancel,
}: SideBarInputProps) {
  const [value, setValue] = useState<string>(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMounted = useRef(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
      isMounted.current = true
    }, 150)

    return () => clearTimeout(timeout)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    if (!defaultValue) return
    const dot = defaultValue.lastIndexOf(".")
    e.target.setSelectionRange(0, dot > 0 ? dot : defaultValue.length)
  }

  function trySubmit() {
    if (!isMounted.current) return

    const trimmed = value.trim()
    if (trimmed && trimmed !== defaultValue) onSubmit(trimmed)
    else onCancel()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      trySubmit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onBlur={trySubmit}
      placeholder={placeholder}
      className="h-7 rounded-sm px-1.5 py-0 text-xs"
    />
  )
}
