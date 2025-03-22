"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import styles from "./entity-form.module.css"

interface EntityFormProps {
  entityType: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function EntityForm({ entityType, onSubmit, onCancel }: EntityFormProps) {
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])

  const getFormFields = () => {
    switch (entityType) {
      case "rider":
        return [
          { id: "name", label: "Name", type: "text", required: true },
          { id: "email", label: "Email", type: "email", required: true },
          { id: "phone", label: "Phone", type: "tel", required: false },
          { id: "location", label: "Location", type: "text", required: true },
          {
            id: "schedule",
            label: "Schedule",
            type: "select",
            options: ["Morning", "Afternoon", "Evening", "Flexible"],
            required: true,
          },
          { id: "preference", label: "Preference", type: "textarea", required: false },
        ]
      case "driver":
        return [
          { id: "name", label: "Name", type: "text", required: true },
          { id: "email", label: "Email", type: "email", required: true },
          { id: "phone", label: "Phone", type: "tel", required: true },
          { id: "vehicle", label: "Vehicle", type: "text", required: true },
          { id: "location", label: "Location", type: "text", required: true },
          {
            id: "schedule",
            label: "Schedule",
            type: "select",
            options: ["Morning", "Afternoon", "Evening", "Flexible"],
            required: true,
          },
          { id: "preference", label: "Preference", type: "textarea", required: false },
        ]
      case "paper":
        return [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "authors", label: "Authors", type: "text", required: true },
          { id: "abstract", label: "Abstract", type: "textarea", required: true },
          { id: "keywords", label: "Keywords", type: "text", required: true },
          {
            id: "topic",
            label: "Topic",
            type: "select",
            options: ["Computer Science", "Mathematics", "Physics", "Biology", "Chemistry", "Other"],
            required: true,
          },
          { id: "length", label: "Length (pages)", type: "number", required: true },
        ]
      default:
        return [
          { id: "name", label: "Name", type: "text", required: true },
          { id: "description", label: "Description", type: "textarea", required: false },
        ]
    }
  }

  const formFields = getFormFields()

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }])
  }

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes]
    newAttributes.splice(index, 1)
    setAttributes(newAttributes)
  }

  const handleAttributeChange = (index: number, field: "key" | "value", value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const data: any = {}

    formFields.forEach((field) => {
      data[field.id] = formData.get(field.id)
    })

    data.attributes = attributes.filter((attr) => attr.key && attr.value)

    onSubmit(data)
  }

  return (
    <Card className={styles.formCard}>
      <CardHeader>
        <CardTitle>Add {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</CardTitle>
        <CardDescription>Enter the details for the new {entityType.toLowerCase()}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className={styles.formFields}>
            {formFields.map((field) => (
              <div key={field.id} className={styles.formGroup}>
                <Label htmlFor={field.id} className={styles.formLabel}>
                  {field.label}
                  {field.required && <span className={styles.required}>*</span>}
                </Label>

                {field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    name={field.id}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                    className={styles.formTextarea}
                  />
                ) : field.type === "select" ? (
                  <Select name={field.id}>
                    <SelectTrigger id={field.id}>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                    className={styles.formInput}
                  />
                )}
              </div>
            ))}

            <div className={styles.attributesSection}>
              <div className={styles.attributesHeader}>
                <Label className={styles.attributesLabel}>Additional Attributes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttribute}
                  className={styles.addAttributeButton}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Attribute
                </Button>
              </div>

              {attributes.map((attr, index) => (
                <div key={index} className={styles.attributeRow}>
                  <div className={styles.attributeFields}>
                    <div className={styles.attributeField}>
                      <Input
                        placeholder="Attribute name"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                        className={styles.attributeInput}
                      />
                    </div>
                    <div className={styles.attributeField}>
                      <Input
                        placeholder="Attribute value"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                        className={styles.attributeInput}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttribute(index)}
                    className={styles.removeAttributeButton}
                    disabled={attributes.length === 1}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove attribute</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className={styles.formFooter}>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

