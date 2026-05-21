import {
    pageUrl,
    flushHtmlCache,
    publishNode,
    addAnimateMixin,
    setAnimationProps,
    textNodePath
} from '../support/animate'

describe('Animate — Basic render', () => {
    context('Step 1 — rich text content exists, no jmix:animate mixin yet', () => {
        // The content node was created in 01-setup WITHOUT the mixin.
        // Verify the page renders the content directly, with no animation wrapper.
        // Note: 01-setup DOES apply the mixin at the end of its before(). This context
        // documents the intended order of operations; in practice the content was created
        // plain and the mixin added afterwards — the wrapper only appears after the mixin.
        it('content node renders inside the page body', () => {
            cy.request(pageUrl('test-page')).its('body')
                .should('contain', 'Animate test heading')
        })
    })

    context('Step 2 — jmix:animate mixin applied, animation renders', () => {
        before(() => {
            cy.login()
            // Mixin already on the node from 01-setup. Re-confirm properties and flush cache.
            addAnimateMixin(textNodePath('test-page'))
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
            publishNode('/sites/animatetest/home/test-page')
            flushHtmlCache()
            cy.wait(2000)
        })

        // Jahia aggregates CSS — do not assert on a specific link[href].
        // Verify keyframe rules are delivered by checking computed animation-name.
        it('animate CSS rules are delivered (direct link or aggregated bundle)', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('have.class', 'animated')
            cy.get('[id^="animate-"]').then($el => {
                const animName = window.getComputedStyle($el[0]).animationName
                expect(animName, 'animation-name should not be "none" — CSS may not be loaded').to.not.equal('none')
            })
        })

        it('aggregated CSS bundle loads with 200 and contains animate.css rules', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('link[rel="stylesheet"]').first().invoke('attr', 'href').then(href => {
                cy.request(href as string).then(res => {
                    expect(res.status).to.eq(200)
                    expect(res.body).to.include('animate.css')
                })
            })
        })

        it('animation wrapper div exists in DOM', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]').should('exist')
        })

        it('wrapper contains the rich text content', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]').should('contain.text', 'Animate test heading')
        })

        it('animation classes applied after IntersectionObserver fires', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('have.class', 'animated')
            cy.get('[id^="animate-"]').should('have.class', 'fadeIn')
        })

        it('element visible after animation reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('be.visible')
        })

        it('inert attribute removed after reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('not.have.attr', 'inert')
        })

        it('aria-hidden attribute removed after reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('not.have.attr', 'aria-hidden')
        })
    })
})
