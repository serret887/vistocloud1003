import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApplicationSummary } from '@/models/application'

export const applicationsColumns: ColumnDef<ApplicationSummary>[] = [
  {
    accessorKey: 'loanNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Loan #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const loanNumber = row.getValue('loanNumber') as string
      return (
        <Link 
          to={`/application/${loanNumber}`}
          className="font-medium text-blue-600 hover:text-blue-800 underline"
        >
          {loanNumber}
        </Link>
      )
    },
  },
  {
    accessorKey: 'clientName',
    header: 'Client Name',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('clientName')}</div>
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
      const statusColors = {
        'In Process': 'bg-blue-100 text-blue-800',
        'Scheduled to Close': 'bg-green-100 text-green-800',
        'Closed': 'bg-gray-100 text-gray-800',
        'Suspended': 'bg-yellow-100 text-yellow-800',
        'Declined': 'bg-red-100 text-red-800',
        'Adverse Action': 'bg-red-100 text-red-800',
        'Unacceptable Submission': 'bg-orange-100 text-orange-800'
      }
      
      const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      
      return (
        <Badge className={colorClass}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'statusDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Status Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('statusDate'))
      return <div>{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>
    },
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => {
      return <div>{row.getValue('channel')}</div>
    },
  },
  {
    accessorKey: 'purpose',
    header: 'Purpose',
    cell: ({ row }) => {
      return <div>{row.getValue('purpose')}</div>
    },
  },
  {
    accessorKey: 'lockExpiration',
    header: 'Lock (Commitment) Expiration',
    cell: ({ row }) => {
      const expiration = row.getValue('lockExpiration') as string | null
      if (!expiration) {
        return <div className="text-muted-foreground">Not Locked</div>
      }
      const date = new Date(expiration)
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: 'targetClosingDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Target Closing/Signing Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const targetDate = row.getValue('targetClosingDate') as string | null
      const relativeDays = row.original.relativeDaysToTarget
      
      if (!targetDate) {
        return <div className="text-muted-foreground">Not set</div>
      }
      
      const date = new Date(targetDate)
      const dateStr = date.toLocaleDateString()
      
      if (relativeDays !== null) {
        const relativeStr = relativeDays > 0 
          ? `(in ${relativeDays} days)`
          : relativeDays < 0 
            ? `(${Math.abs(relativeDays)} days ago)`
            : '(today)'
        
        return (
          <div>
            {dateStr} <span className="text-muted-foreground">{relativeStr}</span>
          </div>
        )
      }
      
      return <div>{dateStr}</div>
    },
  },
  {
    accessorKey: 'docAlerts',
    header: 'Doc Alerts',
    cell: ({ row }) => {
      const docAlerts = row.getValue('docAlerts') as ApplicationSummary['docAlerts']
      
      const iconMap = {
        'OK': <CheckCircle className="h-4 w-4 text-green-600" />,
        'Needs Attention': <AlertTriangle className="h-4 w-4 text-yellow-600" />,
        'Missing': <XCircle className="h-4 w-4 text-red-600" />
      }
      
      const icon = iconMap[docAlerts.state as keyof typeof iconMap] || <AlertTriangle className="h-4 w-4 text-gray-600" />
      
      return (
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{docAlerts.state}</span>
        </div>
      )
    },
  },
]
