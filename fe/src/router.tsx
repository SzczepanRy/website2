// fe/src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // to generuje się automatycznie

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // uzupełniasz to w App.tsx
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
