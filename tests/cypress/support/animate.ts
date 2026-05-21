import {createSite as jahiaCreateSite, deleteSite as jahiaDeleteSite, enableModule} from '@jahia/cypress'

export const siteKey = 'animatetest'
export const textNodeName = 'test-text'
export const testPageName = 'test-page'

export const pageUrl = (pageName: string) =>
    `/cms/render/live/en/sites/${siteKey}/home/${pageName}.html`

export const editFrameUrl = (pageName: string) =>
    `/cms/editframe/default/en/sites/${siteKey}/home/${pageName}.html`

// Deploys the empty-templates JAR bundled in fixtures/modules/.
// Uses forceUpdate:false so the install is a no-op if the module is already present.
export const deployEmptyTemplates = () => {
    const jahiaUrl = Cypress.env('JAHIA_URL') || 'http://localhost:8080'
    const password = Cypress.env('SUPER_USER_PASSWORD') || 'root1234'
    const jar = `${Cypress.config('projectRoot')}/cypress/fixtures/modules/empty-templates-1.0.0.jar`

    cy.exec(
        `curl -sf -u "root:${password}" ` +
        `-X POST "${jahiaUrl}/modules/api/provisioning" ` +
        `--form "script=[{\\"installAndStartBundle\\":\\"empty-templates-1.0.0.jar\\",\\"forceUpdate\\":false}]" ` +
        `--form "file=@${jar}"`,
        {timeout: 60000}
    ).its('code').should('eq', 0)
    cy.wait(3000)
}

// Deploys the animate JAR via the Jahia provisioning REST API.
// Cypress.config('projectRoot') points to tests/, so ../target is animate/target/.
export const deployAnimateModule = () => {
    const jahiaUrl = Cypress.env('JAHIA_URL') || 'http://localhost:8080'
    const password = Cypress.env('SUPER_USER_PASSWORD') || 'root1234'
    const targetDir = `${Cypress.config('projectRoot')}/../target`

    cy.exec(
        `JAR=$(ls "${targetDir}"/animate-*.jar 2>/dev/null | grep -v sources | head -1) && ` +
        `[ -f "$JAR" ] || { echo "ERROR: JAR not found in ${targetDir}"; exit 1; } && ` +
        `JARNAME=$(basename "$JAR") && ` +
        `curl -sf -u "root:${password}" ` +
        `-X POST "${jahiaUrl}/modules/api/provisioning" ` +
        `--form "script=[{\\"installAndStartBundle\\":\\"$JARNAME\\",\\"forceUpdate\\":true,\\"uninstallPreviousVersion\\":true}]" ` +
        `--form "file=@$JAR"`,
        {timeout: 60000}
    ).its('code').should('eq', 0)
    cy.wait(5000)
}

export const createTestSite = () => {
    jahiaCreateSite(siteKey, {
        templateSet: 'empty-templates',
        serverName: 'localhost',
        locale: 'en'
    })
    enableModule('animate', siteKey)
}

export const deleteTestSite = () => {
    jahiaDeleteSite(siteKey)
}

export const createTestPage = (pageName: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: pageName, language: 'en'},
                {name: 'j:templateName', value: 'empty'}
            ],
            children: [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}]
        }
    })
}

// Create a jnt:bigText (rich text) content node first — plain content, no animation mixin.
// jmix:animate is added in a separate step via addAnimateMixin().
export const createRichTextContent = (pageName: string) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/addNode.graphql',
        variables: {
            parentPathOrId: `/sites/${siteKey}/home/${pageName}/pagecontent`,
            name: textNodeName,
            primaryNodeType: 'jnt:bigText',
            properties: [
                {
                    name: 'text',
                    value: '<h2>Animate test heading</h2><p>This rich text content is wrapped by the animate module.</p>',
                    language: 'en'
                }
            ]
        }
    })
}

// Step 1 of 2 — add the jmix:animate mixin to an existing content node.
// Call once per node (at setup time). addMixins is idempotent so re-running is safe,
// but semantically the mixin should be added right after the content node is created.
export const addAnimateMixin = (pathOrId: string) => {
    cy.apollo({
        mutationFile: 'graphql/animate/addAnimateMixin.graphql',
        variables: {pathOrId}
    })
}

// Step 2 of 2 — set (or update) animation properties on a node that already has jmix:animate.
// Call this in test before() hooks to configure the specific animation scenario under test.
export const setAnimationProps = (
    pathOrId: string,
    props: {
        animation?: string
        animationDelay?: number
        animationIterationCount?: string
        animationDelayUsage?: string
    } = {}
) => {
    cy.apollo({
        mutationFile: 'graphql/animate/setAnimateProperties.graphql',
        variables: {
            pathOrId,
            animation: props.animation ?? 'fadeIn',
            animationDelay: String(props.animationDelay ?? 0),
            animationIterationCount: props.animationIterationCount ?? '1',
            animationDelayUsage: props.animationDelayUsage ?? 'delayBeforeAnimation'
        }
    })
}

export const publishNode = (pathOrId: string, options: {includeSubTree?: boolean; waitMs?: number} = {}) => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql',
        variables: {
            pathOrId,
            languages: ['en'],
            publishSubNodes: true,
            includeSubTree: options.includeSubTree ?? true
        }
    })
    cy.wait(options.waitMs ?? 3000)
}

// Flush ALL Jahia Ehcache instances so that the next page request gets a fresh render.
export const flushHtmlCache = () => {
    cy.executeGroovy('groovy/animate/flushHtmlCache.groovy')
}

export const textNodePath = (pageName: string) =>
    `/sites/${siteKey}/home/${pageName}/pagecontent/${textNodeName}`
