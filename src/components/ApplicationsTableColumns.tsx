import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Application } from '@/types/application'

export const applicationsColumns: ColumnDef<Application>[] = [
  {
    accessorKey: 'applicationNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Application Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const application = row.original
      return (
        <Link 
          href={`/application?appId=${application.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {application.applicationNumber}
        </Link>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusColors: Record<string, string> = {
        'draft': 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'suspended': 'bg-yellow-100 text-yellow-800',
        'declined': 'bg-red-100 text-red-800',
      }
      
      const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800'
      
      return (
        <Badge className={colorClass}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as unknown
      if (!createdAt) return <div className="text-muted-foreground">N/A</div>
      
      let date: Date
      if (typeof createdAt === 'object' && createdAt !== null && 'toDate' in createdAt && typeof createdAt.toDate === 'function') {
        date = createdAt.toDate()
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt)
      } else {
        return <div className="text-muted-foreground">Invalid date</div>
      }
      
      return <div>{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>
    },
  },
  {
    accessorKey: 'currentStepId',
    header: 'Current Step',
    cell: ({ row }) => {
      const stepId = row.getValue('currentStepId') as string | undefined
      if (!stepId) return <div className="text-muted-foreground">Not started</div>
      return <div className="capitalize">{stepId.replace('-', ' ')}</div>
    },
  },
  {
    accessorKey: 'overallProgress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('overallProgress') as number | undefined
      if (progress === undefined) return <div className="text-muted-foreground">0%</div>
      return <div>{progress}%</div>
    },
  },
]
