import {pageUrl, flushHtmlCache, setAnimationProps, publishNode, textNodePath} from '../support/animate'

describe('Animate — Reduced motion (WCAG 2.3.3 / 2.2.2)', () => {
    before(() => {
        cy.login()
        setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
        publishNode(`/sites/animatetest/home/test-page`)
        flushHtmlCache()
        cy.wait(2000)
    })

    context('prefers-reduced-motion: reduce', () => {
        beforeEach(() => {
            // Emulate reduced motion via Chrome DevTools Protocol
            cy.wrap(null).then(() =>
                Cypress.automation('remote:debugger:protocol', {
                    command: 'Emulation.setEmulatedMedia',
                    params: {
                        media: 'screen',
                        features: [{name: 'prefers-reduced-motion', value: 'reduce'}]
                    }
                })
            )
        })

        afterEach(() => {
            cy.wrap(null).then(() =>
                Cypress.automation('remote:debugger:protocol', {
                    command: 'Emulation.setEmulatedMedia',
                    params: {media: 'screen', features: []}
                })
            )
        })

        it('element is revealed (visible) even with reduced motion', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 3000}).should('be.visible')
        })

        it('animation class "animated" is NOT added with reduced motion', () => {
            cy.visit(pageUrl('test-page'))
            cy.wait(500)
            cy.get('[id^="animate-"]').should('not.have.class', 'animated')
        })

        it('animation class "fadeIn" is NOT added with reduced motion', () => {
            cy.visit(pageUrl('test-page'))
            cy.wait(500)
            cy.get('[id^="animate-"]').should('not.have.class', 'fadeIn')
        })

        it('inert attribute removed even with reduced motion', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 3000}).should('not.have.attr', 'inert')
        })
    })
})
