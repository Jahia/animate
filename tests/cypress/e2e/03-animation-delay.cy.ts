import {setAnimationProps, publishNode, flushHtmlCache, pageUrl, textNodePath} from '../support/animate'

describe('Animate — Delay modes', () => {
    context('delayBeforeAnimation — CSS animationDelay applied', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {
                animation: 'fadeIn',
                animationDelay: 1,
                animationDelayUsage: 'delayBeforeAnimation'
            })
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('element reveals immediately (not after delay)', () => {
            cy.visit(pageUrl('test-page'))
            // element should be visible without waiting for delay
            cy.get('[id^="animate-"]', {timeout: 3000}).should('be.visible')
        })

        it('CSS animationDelay property is set on the element', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 3000})
                .should('have.css', 'animation-delay')
                .and('match', /^[0-9.]+s$/)
        })
    })

    context('delayBeforeDisplay — setTimeout before reveal', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {
                animation: 'fadeIn',
                animationDelay: 0.5,
                animationDelayUsage: 'delayBeforeDisplay'
            })
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('element is hidden immediately after load', () => {
            cy.visit(pageUrl('test-page'))
            // check immediately — before the 500ms setTimeout fires
            cy.get('[id^="animate-"]').invoke('css', 'opacity').should('eq', '0')
        })

        it('element becomes visible after delay', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 3000}).should('be.visible')
        })
    })

    after(() => {
        cy.login()
        // reset to default (no delay)
        setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
        publishNode(`/sites/animatetest/home/test-page`)
        flushHtmlCache()
    })
})
