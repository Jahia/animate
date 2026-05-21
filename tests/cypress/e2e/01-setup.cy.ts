import {
    deployEmptyTemplates,
    deployAnimateModule,
    createTestSite,
    deleteTestSite,
    createTestPage,
    createRichTextContent,
    addAnimateMixin,
    setAnimationProps,
    publishNode,
    pageUrl,
    textNodePath
} from '../support/animate'

describe('Animate — Setup', () => {
    before(() => {
        cy.login()
        deployEmptyTemplates()
        deployAnimateModule()
        deleteTestSite()
        createTestSite()
        createTestPage('test-page')
        createRichTextContent('test-page')          // 1. content node exists first
        addAnimateMixin(textNodePath('test-page'))  // 2. add jmix:animate mixin to that node
        setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'}) // 3. configure animation
        publishNode(`/sites/animatetest/home`, {includeSubTree: true, waitMs: 5000})
    })

    it('animate module is deployed and started', () => {
        cy.apollo({
            queryFile: 'graphql/jcr/query/getStartedModulesVersion.graphql'
        }).then((resp: any) => {
            const modules: any[] = resp?.data?.dashboard?.modules ?? []
            const animate = modules.find((m: any) => m.id === 'animate')
            expect(animate, 'animate module not found — deploy the OSGi bundle first').to.exist
        })
    })

    it('test-page is accessible in live mode', () => {
        cy.request({url: pageUrl('test-page'), failOnStatusCode: false})
            .its('status').should('eq', 200)
    })

    it('rendered page contains a <body> element', () => {
        cy.request(pageUrl('test-page')).its('body').should('contain', '</body>')
    })
})
