"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

type SearchFormProps = React.ComponentProps<"form"> & {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  inputId?: string
}

export function SearchForm({
  value,
  onValueChange,
  placeholder = "Type to search...",
  inputId,
  onSubmit,
  ...props
}: SearchFormProps) {
  const generatedId = React.useId()
  const resolvedInputId = inputId ?? generatedId

  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(event)
      }}
    >
      <div className="relative">
        <Label htmlFor={resolvedInputId} className="sr-only">
          Search
        </Label>
        <SidebarInput
          id={resolvedInputId}
          placeholder={placeholder}
          className="h-8 pl-7"
          onChange={(event) => onValueChange?.(event.target.value)}
          {...(value !== undefined ? { value } : {})}
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
