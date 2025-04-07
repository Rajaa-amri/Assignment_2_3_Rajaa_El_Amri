import { defineBoot } from '#q-app/wrappers'
import { createAuth0 } from '@auth0/auth0-vue'
 
export default defineBoot(({ app }) => {
  app.use(
    createAuth0({
      domain: 'dev-4yituajghfjc8wca.us.auth0.com',
      clientId: 't9wzE0t0AxЗCy0LSQt8QU39cTrE2Gg1X',
      authorizationParams: {
        redirect_uri: 'http://localhost:9000',
      },
    }),
  )
})