import type { StepStatus } from '@/models/application'

export default function ApplicationStepItem({ title }: { title: string; status?: StepStatus }) {
  return <div>{title}</div>
}
