import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/upload/')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: UploadComponent,
})
function UploadComponent() {
  return (
    <div className="">
      <h1 className="">podstrona uplad</h1>
      <input type='file' placeholder='select file'/>
      <button>send</button>
    </div>
  )
}
