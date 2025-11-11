import ApplicationForm from './ApplicationForm'

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ApplicationForm>{children}</ApplicationForm>
}

