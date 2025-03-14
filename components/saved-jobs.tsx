"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Edit, MoreHorizontal, Search, Trash2, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Update the Job interface to match the changes in job-calculator.tsx
// Import the Worker interface
import type { Job } from "./job-calculator"

export default function SavedJobs() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)

  useEffect(() => {
    // Load saved jobs from localStorage
    const savedJobs = localStorage.getItem("savedJobs")
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs))
    }
  }, [])

  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteJob = (id: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== id)
    setJobs(updatedJobs)
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs))
    setDeleteJobId(null)

    toast({
      title: "Job deleted",
      description: "The job has been removed from your saved jobs",
    })
  }

  const duplicateJob = (job: Job) => {
    const newJob = {
      ...job,
      id: crypto.randomUUID(),
      name: `${job.name} (Copy)`,
      date: new Date().toISOString(),
    }

    const updatedJobs = [...jobs, newJob]
    setJobs(updatedJobs)
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs))

    toast({
      title: "Job duplicated",
      description: `A copy of ${job.name} has been created`,
    })
  }

  const exportJobs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "job_profitability_data.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "Export successful",
      description: "Your job data has been exported",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>View and manage your saved job calculations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportJobs}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No saved jobs yet. Use the calculator to create and save jobs.
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No jobs match your search criteria.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Recommended Rate</TableHead>
                  <TableHead className="text-right">Actual Rate</TableHead>
                  <TableHead className="text-right">Profitability</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>{formatDate(job.date)}</TableCell>
                    <TableCell className="capitalize">{job.jobType}</TableCell>
                    <TableCell className="text-right">${job.totalCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${job.recommendedRate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${job.actualRate.toFixed(2)}</TableCell>
                    <TableCell className={`text-right ${job.profitability >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {job.profitability.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => duplicateJob(job)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteJobId(job.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={!!deleteJobId} onOpenChange={(open) => !open && setDeleteJobId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this job? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteJobId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteJobId && deleteJob(deleteJobId)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

