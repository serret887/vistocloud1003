import ApplicationForm from "../ApplicationForm"

export default function ApplicationInstanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ApplicationForm>{children}</ApplicationForm>
}



