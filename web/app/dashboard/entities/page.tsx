"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Upload, Download, Trash, Edit, Search } from "lucide-react"
import styles from "./page.module.css"

interface EntityType {
  id: string
  name: string
  description: string
  attributes: string[]
  count: number
}

export default function EntitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const { toast } = useToast()

  const entityTypes: EntityType[] = [
    {
      id: "rider",
      name: "Rider",
      description: "People looking for rides",
      attributes: ["location", "schedule", "preference"],
      count: 24,
    },
    {
      id: "driver",
      name: "Driver",
      description: "People offering rides",
      attributes: ["location", "schedule", "preference"],
      count: 18,
    },
    {
      id: "paper",
      name: "Paper",
      description: "Academic papers for review",
      attributes: ["topic", "length", "keywords"],
      count: 42,
    },
    {
      id: "reviewer",
      name: "Reviewer",
      description: "People who review papers",
      attributes: ["expertise", "availability", "conflicts"],
      count: 15,
    },
    {
      id: "job",
      name: "Job",
      description: "Job positions",
      attributes: ["title", "requirements", "location"],
      count: 36,
    },
    {
      id: "candidate",
      name: "Candidate",
      description: "Job seekers",
      attributes: ["skills", "experience", "location"],
      count: 58,
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "People offering mentorship",
      attributes: ["expertise", "experience", "availability"],
      count: 12,
    },
    {
      id: "mentee",
      name: "Mentee",
      description: "People seeking mentorship",
      attributes: ["goals", "interests", "availability"],
      count: 27,
    },
    {
      id: "team",
      name: "Team",
      description: "Project teams",
      attributes: ["size", "project", "requirements"],
      count: 8,
    },
    {
      id: "member",
      name: "Member",
      description: "Team members",
      attributes: ["skills", "personality", "availability"],
      count: 45,
    },
  ]

  const filteredEntityTypes = entityTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddEntity = () => {
    setIsAddDialogOpen(false)

    toast({
      title: "Entity Added",
      description: "The new entity has been added successfully.",
    })
  }

  const handleImportEntities = () => {
    setIsImportDialogOpen(false)

    toast({
      title: "Entities Imported",
      description: "The entities have been imported successfully.",
    })
  }

  const handleExportEntities = () => {
    toast({
      title: "Entities Exported",
      description: "The entities have been exported successfully.",
    })
  }

  return (
    <div className={styles.entitiesPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Entity Management</h1>
        <p className={styles.pageDescription}>Manage all entities used in the matching system</p>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.actionButtons}>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className={styles.actionButton}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entity Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Entity Type</DialogTitle>
                <DialogDescription>Create a new entity type for the matching system</DialogDescription>
              </DialogHeader>

              <div className={styles.formGroup}>
                <Label htmlFor="entity-name">Entity Name</Label>
                <Input id="entity-name" placeholder="e.g., Student" />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="entity-description">Description</Label>
                <Input id="entity-description" placeholder="e.g., Students looking for study groups" />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="entity-attributes">Attributes (comma separated)</Label>
                <Input id="entity-attributes" placeholder="e.g., major, year, interests" />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntity}>Add Entity Type</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={styles.actionButton}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Entities</DialogTitle>
                <DialogDescription>Upload a CSV or JSON file to import entities</DialogDescription>
              </DialogHeader>

              <div className={styles.formGroup}>
                <Label htmlFor="entity-type">Entity Type</Label>
                <Select>
                  <SelectTrigger id="entity-type">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="file-upload">Upload File</Label>
                <div className={styles.fileUpload}>
                  <Input id="file-upload" type="file" className={styles.fileInput} />
                  <p className={styles.fileHint}>Supported formats: CSV, JSON</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportEntities}>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className={styles.actionButton} onClick={handleExportEntities}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className={styles.entityGrid}>
        {filteredEntityTypes.map((entityType) => (
          <Card
            key={entityType.id}
            className={`${styles.entityCard} ${selectedEntityType === entityType.id ? styles.selectedCard : ""}`}
            onClick={() => setSelectedEntityType(entityType.id)}
          >
            <CardHeader className={styles.entityCardHeader}>
              <CardTitle className={styles.entityCardTitle}>{entityType.name}</CardTitle>
              <CardDescription>{entityType.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.entityCount}>
                <span className={styles.countValue}>{entityType.count}</span>
                <span className={styles.countLabel}>entities</span>
              </div>

              <div className={styles.attributesList}>
                <h4 className={styles.attributesTitle}>Attributes:</h4>
                <div className={styles.attributes}>
                  {entityType.attributes.map((attr) => (
                    <span key={attr} className={styles.attributeTag}>
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className={styles.entityCardFooter}>
              <Button variant="outline" size="sm" className={styles.entityAction}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className={styles.entityAction}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

