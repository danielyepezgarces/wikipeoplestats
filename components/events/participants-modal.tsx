"use client"

import { useState } from "react"
import type { Participant } from "@/types/events"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, ExternalLink } from "lucide-react"

interface ParticipantsModalProps {
  participants: Participant[]
}

export default function ParticipantsModal({ participants }: ParticipantsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      // Parse the YmdHis format (e.g., "20250101120000")
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      const hour = dateString.substring(8, 10)
      const minute = dateString.substring(10, 12)
      const second = dateString.substring(12, 14)

      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
      return date.toLocaleString("es-ES")
    } catch {
      return "N/A"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Users className="mr-2 h-4 w-4" />
          Ver Lista de Participantes ({participants.length})
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lista de Participantes</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registrado el
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {participants.map((participant, index) => (
                <tr key={participant.participant_id || index} className="hover:bg-muted/25">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://meta.wikimedia.org${participant.user_page?.path || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      {participant.user_name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(participant.user_registered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay participantes registrados</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
