"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("audio", file)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze audio")
      }

      const result = await response.json()
      // Handle the result (e.g., update state to display results)
      console.log(result)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="audio-file">Upload Audio File (MP3 or M4A)</Label>
        <Input id="audio-file" type="file" accept=".mp3,.m4a" onChange={handleFileChange} required />
      </div>
      <Button type="submit" disabled={!file || isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Pronunciation"}
      </Button>
    </form>
  )
}

