'use client'

import { deleteProject } from '@/server/actions'
import { Trash, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  id: number
  name?: string
  onDelete?: () => void
  size?: 'sm' | 'default'
}

interface ProjectResponse {
  id: number
  name: string
  [key: string]: unknown
}

const TrashButton = ({ id, onDelete, size = 'default' }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProject(id) as ProjectResponse | null
      
      if (res?.name) {
        // Show success toast
        toast.success("Project deleted", {
          description: `"${res.name}" has been permanently deleted`,
        })
        
        // Callback to update UI immediately
        onDelete?.()
        
        // Force a router refresh to update all data
        router.refresh()
        
        // Navigate to dashboard if we're on a project page
        if (window.location.pathname.includes(`/${id}`)) {
          router.push('/search')
        }
      } else {
        // Show error toast
        toast.error("Failed to delete", {
          description: "There was an error deleting this project",
        })
      }
    } catch (error: unknown) {
      console.error("Error deleting project:", error)
      toast.error("An error occurred", {
        description: "There was a problem with your request",
      })
    } finally {
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  // Reset confirmation state when mouse leaves
  const handleMouseLeave = () => {
    if (!isDeleting) {
      setIsConfirming(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <div onMouseLeave={handleMouseLeave} className="inline-flex">
          {!isConfirming ? (
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size === 'sm' ? 'icon' : 'sm'}
                onClick={() => setIsConfirming(true)}
                disabled={isDeleting}
                className={`${size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'} text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
                aria-label="Delete project"
              >
                <Trash size={size === 'sm' ? 14 : 16} />
              </Button>
            </TooltipTrigger>
          ) : (
            <Button
              variant="destructive"
              size={size === 'sm' ? 'icon' : 'sm'}
              onClick={handleDelete}
              disabled={isDeleting}
              className={`${size === 'sm' ? 'h-7 w-7' : 'h-8'} animate-pulse`}
            >
              {isDeleting ? (
                <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
              ) : (
                "Delete?"
              )}
            </Button>
          )}
        </div>
        <TooltipContent side="bottom">
          {isConfirming ? "Click to confirm deletion" : "Delete project"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TrashButton