import ClientWrapper from "./client-wrapper"

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return <ClientWrapper id={params.id} />
}
