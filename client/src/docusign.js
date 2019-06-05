import { guid } from './react-simple-auth'

const YOUR_REQUESTED_SCOPES = "signature"
const YOUR_INTEGRATOR_KEY = "247b739d-8ef3-456e-962e-f20cc0365365"

export const docusignProvider = {
    buildAuthorizeUrl() {
        return `https://account-d.docusign.com/oauth/auth?response_type=token
        &scope=${YOUR_REQUESTED_SCOPES}
        &client_id=${YOUR_INTEGRATOR_KEY}
        &prompt=login
        &state=${guid()}
        &redirect_uri=${encodeURIComponent(`${window.location.origin}/redirect.html`)}`

        // return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=id_token+token
        // &scope=https%3A%2F%2Fgraph.microsoft.com%2Fuser.read%20openid%20profile
        // &client_id=606b0d7c-9062-474c-a5b0-cb9a61baf566
        // &redirect_uri=${encodeURIComponent(`${window.location.origin}/redirect.html`)}
        // &state=${guid()}
        // &nonce=${guid()}
        // &client_info=1
        // &x-client-SKU=MSAL-JS-SUCKS
        // &x-client-Ver=1.0.0
        // &client-request-id=${guid()}
        // &login_hint=mattmazzola%40live.com
        // &domain_req=${guid()}
        // &login_req=${guid()}
        // &domain_hint=consumers
        // &prompt=login`
    },

    extractError(redirectUrl) {
        const errorMatch = redirectUrl.match(/error=([^&]+)/)
        if (!errorMatch) {
            return undefined
        }

        const errorReason = errorMatch[1]
        const errorDescriptionMatch = redirectUrl.match(/error_description=([^&]+)/)
        const errorDescription = errorDescriptionMatch ? errorDescriptionMatch[1] : ''
        return new Error(`Error during login. Reason: ${errorReason} Description: ${errorDescription}`)
    },

    extractSession(redirectUrl) {
        let accessToken = null
        const accessTokenMatch = redirectUrl.match(/access_token=([^&]+)/)
        if (accessTokenMatch) {
            accessToken = accessTokenMatch[1]
        }

        let idToken = null
        let decodedIdToken = null
        const idTokenMatch = redirectUrl.match(/id_token=([^&]+)/)
        if (idTokenMatch) {
            idToken = idTokenMatch[1]
            decodedIdToken = JSON.parse(atob(idToken.split('.')[1]))
        }

        let expireDurationSeconds = 3600
        const expireDurationSecondsMatch = redirectUrl.match(/expires_in=([^&]+)/)
        if (expireDurationSecondsMatch) {
            expireDurationSeconds = parseInt(expireDurationSecondsMatch[1])
        }

        return {
            accessToken,
            expireDurationSeconds,
            idToken,
            decodedIdToken
        }
    },

    validateSession(session) {
        const now = (new Date()).getTime() / 1000
        
        // With normal JWT tokens you can inspect the `exp` Expiration claim; however,
        // AAD V2 tokens are opaque and we must use the token meta about expiration time
        // "When you request an access token from the v2.0 endpoint, the v2.0 endpoint also returns metadata about the access token for your app to use."
        // See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens
        // Here we are leveraging the fact that the access token was issued at the same
        // time as the ID token and can use its `iat` Issued At claim + the duration
        // to compute an absolute expiration time
        const expiration = session.decodedIdToken.iat + session.expireDurationSeconds

        // 15 minutes minimum duration until token expires
        const minimumDuration = 60 * 15
        return (expiration - now) > minimumDuration
    },

    getAccessToken(session, resourceId) {
        return session.accessToken
    },

    getSignOutUrl(redirectUrl) {
        return `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`
    }
}